"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  ClipboardIcon,
  ImagePlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RefreshCcwIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_SELECTION_MODE,
  QUALITY_PRESETS,
  SIZE_PRESETS,
  type Category,
  type QualityPresetId,
  type SizePresetId,
} from "@/lib/constants";
import { compilePrompt } from "@/lib/prompt/compiler";
import { cn } from "@/lib/utils";
import {
  useCurrentCombinationStore,
  type CompilerMode,
  type SelectedAtom,
} from "@/stores/current-combination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type PromptAtom = SelectedAtom & {
  createdAt: string;
  updatedAt: string;
};

type AtomFormState = {
  id?: string;
  category: Category;
  title: string;
  subtitle: string;
  previewImagePath: string;
  prompt: string;
  negativePrompt: string;
  tagsText: string;
  notes: string;
};

const emptyForm: AtomFormState = {
  category: "人設",
  title: "",
  subtitle: "",
  previewImagePath: "",
  prompt: "",
  negativePrompt: "",
  tagsText: "",
  notes: "",
};

function toForm(atom?: PromptAtom, category: Category = "人設"): AtomFormState {
  if (!atom) {
    return { ...emptyForm, category };
  }

  return {
    id: atom.id,
    category: atom.category,
    title: atom.title,
    subtitle: atom.subtitle,
    previewImagePath: atom.previewImagePath,
    prompt: atom.prompt,
    negativePrompt: atom.negativePrompt,
    tagsText: atom.tags.join("、"),
    notes: atom.notes,
  };
}

function formPayload(form: AtomFormState) {
  return {
    category: form.category,
    title: form.title,
    subtitle: form.subtitle,
    previewImagePath: form.previewImagePath,
    prompt: form.prompt,
    negativePrompt: form.negativePrompt,
    tags: form.tagsText
      .split(/[、,，\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    notes: form.notes,
  };
}

export function PromptWorkbench() {
  const [atoms, setAtoms] = useState<PromptAtom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("人設");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<AtomFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PromptAtom | null>(null);

  const {
    selectedAtoms,
    sizePreset,
    qualityPreset,
    compilerMode,
    customPrompt,
    selectAtom,
    removeAtom,
    clearCategory,
    setSizePreset,
    setQualityPreset,
    setCompilerMode,
    setCustomPrompt,
    reset,
  } = useCurrentCombinationStore();

  const compiledPrompt = useMemo(
    () =>
      compilePrompt({
        selectedAtoms,
        sizePreset,
        qualityPreset,
      }),
    [qualityPreset, selectedAtoms, sizePreset],
  );

  const promptText = compilerMode === "auto" ? compiledPrompt : customPrompt;
  const selectedCount = Object.values(selectedAtoms).reduce(
    (total, items) => total + (items?.length ?? 0),
    0,
  );
  const filteredAtoms = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return atoms.filter((atom) => {
      if (atom.category !== activeCategory) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        atom.title,
        atom.subtitle,
        atom.prompt,
        atom.notes,
        ...atom.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [activeCategory, atoms, search]);

  useEffect(() => {
    let isMounted = true;

    async function loadAtoms() {
      const response = await fetch("/api/atoms");

      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        toast.error("讀取素材失敗");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as { atoms: PromptAtom[] };
      setAtoms(data.atoms);
      setIsLoading(false);
    }

    void loadAtoms();

    return () => {
      isMounted = false;
    };
  }, []);

  function openCreateForm(category = activeCategory) {
    setForm(toForm(undefined, category));
    setIsFormOpen(true);
  }

  function openEditForm(atom: PromptAtom) {
    setForm(toForm(atom));
    setIsFormOpen(true);
  }

  async function handleUpload(file: File | null) {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as { path?: string; error?: string };

    if (!response.ok || !data.path) {
      toast.error(data.error ?? "圖片上傳失敗");
      return;
    }

    setForm((current) => ({ ...current, previewImagePath: data.path ?? "" }));
    toast.success("圖片已上傳");
  }

  async function handleSaveAtom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch(form.id ? `/api/atoms/${form.id}` : "/api/atoms", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload(form)),
    });
    const data = (await response.json()) as { atom?: PromptAtom; error?: string };
    setIsSaving(false);

    if (!response.ok || !data.atom) {
      toast.error(data.error ?? "保存素材失敗");
      return;
    }

    const savedAtom = data.atom;
    setAtoms((current) =>
      form.id
        ? current.map((atom) => (atom.id === savedAtom.id ? savedAtom : atom))
        : [savedAtom, ...current],
    );
    setIsFormOpen(false);
    toast.success(form.id ? "素材已更新" : "素材已建立");
  }

  async function handleDeleteAtom() {
    if (!deleteTarget) {
      return;
    }

    const response = await fetch(`/api/atoms/${deleteTarget.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error("刪除素材失敗");
      return;
    }

    setAtoms((current) => current.filter((atom) => atom.id !== deleteTarget.id));
    removeAtom(deleteTarget.category, deleteTarget.id);
    setDeleteTarget(null);
    toast.success("素材已刪除");
  }

  async function copyPrompt() {
    if (!promptText.trim()) {
      toast.warning("目前沒有可複製的 Prompt");
      return;
    }

    await navigator.clipboard.writeText(promptText);
    toast.success("Prompt 已複製");
  }

  function resetCombination() {
    reset();
    toast.success("當前組合已重置");
  }

  function updateCompilerMode(value: string[]) {
    const nextMode = value[0] as CompilerMode | undefined;

    if (!nextMode) {
      return;
    }

    if (nextMode === "custom" && compilerMode === "auto") {
      setCustomPrompt(compiledPrompt);
    }

    setCompilerMode(nextMode);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-4 md:px-6">
        <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
              Prompt 視覺化素材工作台
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              用看圖選擇的方式，把人設、表情、姿態、服裝、場景、風格、鏡頭和妝容組合成可複用的完整 Prompt。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">已啟用 {selectedCount} 個素材</Badge>
            <Button onClick={() => openCreateForm()} size="sm">
              <PlusIcon data-icon="inline-start" />
              新增素材
            </Button>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>創作參數</CardTitle>
                <CardDescription>尺寸與質量只會寫入 Prompt，不會觸發圖片生成。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[minmax(240px,420px)_1fr]">
                <Field>
                  <FieldLabel htmlFor="size-preset">尺寸</FieldLabel>
                  <Select
                    items={SIZE_PRESETS.map((preset) => ({
                      label: preset.label,
                      value: preset.id,
                    }))}
                    value={sizePreset}
                    onValueChange={(value) => setSizePreset(value as SizePresetId)}
                  >
                    <SelectTrigger id="size-preset" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SIZE_PRESETS.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>質量</FieldLabel>
                  <ToggleGroup
                    value={[qualityPreset]}
                    onValueChange={(value) => {
                      if (value[0]) {
                        setQualityPreset(value[0] as QualityPresetId);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-wrap"
                  >
                    {QUALITY_PRESETS.map((preset) => (
                      <ToggleGroupItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle>當前組合</CardTitle>
                    <CardDescription>已啟用 {selectedCount} 個素材</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openCreateForm(activeCategory)}>
                    <ImagePlusIcon data-icon="inline-start" />
                    建立目前分類素材
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {CATEGORIES.map((category) => (
                    <CategorySlot
                      key={category}
                      category={category}
                      selected={selectedAtoms[category] ?? []}
                      onOpen={() => setActiveCategory(category)}
                      onCreate={() => openCreateForm(category)}
                      onRemove={(atomId) => removeAtom(category, atomId)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Prompt 編譯器</CardTitle>
                <CardDescription>自動模式按 PRD 順序編譯；自定義模式不會被素材覆蓋。</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ToggleGroup
                  value={[compilerMode]}
                  onValueChange={updateCompilerMode}
                  variant="outline"
                  size="sm"
                >
                  <ToggleGroupItem value="auto">自動</ToggleGroupItem>
                  <ToggleGroupItem value="custom">自定義</ToggleGroupItem>
                </ToggleGroup>
                <Textarea
                  value={promptText}
                  onChange={(event) => setCustomPrompt(event.target.value)}
                  readOnly={compilerMode === "auto"}
                  className="min-h-[260px] resize-y font-mono text-sm leading-6"
                  placeholder="選擇素材後會自動生成完整 Prompt"
                />
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t">
                <Button variant="outline" onClick={resetCombination}>
                  <RefreshCcwIcon data-icon="inline-start" />
                  重置
                </Button>
                <Button onClick={copyPrompt}>
                  <ClipboardIcon data-icon="inline-start" />
                  複製 Prompt
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle>我的素材</CardTitle>
                <CardDescription>選擇素材會同步寫入當前組合。</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜尋標題、標籤或 Prompt"
                  />
                  <ToggleGroup
                    value={[activeCategory]}
                    onValueChange={(value) => {
                      if (value[0]) {
                        setActiveCategory(value[0] as Category);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full flex-wrap"
                  >
                    {CATEGORIES.map((category) => (
                      <ToggleGroupItem key={category} value={category}>
                        {category}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                {isLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-64 rounded-lg" />
                    ))}
                  </div>
                ) : filteredAtoms.length === 0 ? (
                  <Empty className="min-h-64 rounded-lg border">
                    <EmptyHeader>
                      <EmptyTitle>尚無素材</EmptyTitle>
                      <EmptyDescription>
                        目前分類沒有素材，先建立一個 Prompt 素材。
                      </EmptyDescription>
                    </EmptyHeader>
                    <Button onClick={() => openCreateForm(activeCategory)} size="sm">
                      <PlusIcon data-icon="inline-start" />
                      新增素材
                    </Button>
                  </Empty>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    {filteredAtoms.map((atom) => (
                      <AtomCard
                        key={atom.id}
                        atom={atom}
                        selected={(selectedAtoms[atom.category] ?? []).some(
                          (item) => item.id === atom.id,
                        )}
                        onSelect={() => selectAtom(atom)}
                        onEdit={() => openEditForm(atom)}
                        onCopy={() => {
                          void navigator.clipboard.writeText(atom.prompt);
                          toast.success("素材 Prompt 已複製");
                        }}
                        onDelete={() => setDeleteTarget(atom)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t">
                <Button variant="outline" size="sm" onClick={() => clearCategory(activeCategory)}>
                  清空目前分類
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={handleSaveAtom} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{form.id ? "編輯素材" : "新增素材"}</DialogTitle>
              <DialogDescription>
                保存分類、預覽圖與 Prompt 正文後，即可在目前工作台選用。
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="atom-category">分類</FieldLabel>
                  <Select
                    items={CATEGORIES.map((category) => ({
                      label: category,
                      value: category,
                    }))}
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, category: value as Category }))
                    }
                  >
                    <SelectTrigger id="atom-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="atom-title">標題</FieldLabel>
                  <Input
                    id="atom-title"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="atom-subtitle">副標題</FieldLabel>
                <Input
                  id="atom-subtitle"
                  value={form.subtitle}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subtitle: event.target.value }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="atom-image">預覽圖</FieldLabel>
                <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                  <PreviewImage src={form.previewImagePath} alt="素材預覽圖" />
                  <div className="flex flex-col gap-2">
                    <Input
                      id="atom-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => void handleUpload(event.target.files?.[0] ?? null)}
                    />
                    <Input
                      value={form.previewImagePath}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          previewImagePath: event.target.value,
                        }))
                      }
                      placeholder="上傳後自動填入圖片路徑"
                    />
                    <FieldDescription>圖片會保存到 data/uploads/，素材只保存相對路徑。</FieldDescription>
                  </div>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="atom-prompt">Prompt 正文</FieldLabel>
                <Textarea
                  id="atom-prompt"
                  value={form.prompt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, prompt: event.target.value }))
                  }
                  className="min-h-28 font-mono text-sm"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="atom-negative">Negative Prompt</FieldLabel>
                <Textarea
                  id="atom-negative"
                  value={form.negativePrompt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      negativePrompt: event.target.value,
                    }))
                  }
                  className="min-h-20 font-mono text-sm"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="atom-tags">標籤</FieldLabel>
                <Input
                  id="atom-tags"
                  value={form.tagsText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tagsText: event.target.value }))
                  }
                  placeholder="用頓號或逗號分隔"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="atom-notes">備註</FieldLabel>
                <Textarea
                  id="atom-notes"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  className="min-h-20"
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
                保存素材
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除素材？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作會從素材庫移除「{deleteTarget?.title}」，也會從當前組合取消選擇。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void handleDeleteAtom()}>
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function CategorySlot({
  category,
  selected,
  onOpen,
  onCreate,
  onRemove,
}: {
  category: Category;
  selected: SelectedAtom[];
  onOpen: () => void;
  onCreate: () => void;
  onRemove: (atomId: string) => void;
}) {
  const mode = CATEGORY_SELECTION_MODE[category];

  return (
    <div
      className={cn(
        "flex min-h-48 flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-colors",
        selected.length > 0 ? "border-primary/40" : "border-border",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
        className="flex flex-1 cursor-pointer flex-col gap-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{category}</span>
          <Badge variant="secondary">{mode === "single" ? "單選" : "多選"}</Badge>
        </div>
        {selected.length === 0 ? (
          <div className="flex min-h-32 flex-1 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
            點擊選擇{category}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selected.map((atom) => (
              <div key={atom.id} className="grid grid-cols-[72px_1fr_auto] gap-2 rounded-md bg-muted/40 p-2">
                <PreviewImage src={atom.previewImagePath} alt={`${atom.title} 預覽圖`} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{atom.title}</div>
                  <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {atom.subtitle || "未填副標題"}
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(atom.id);
                  }}
                  aria-label={`取消選擇${atom.title}`}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onCreate}>
        <PlusIcon data-icon="inline-start" />
        新增{category}
      </Button>
    </div>
  );
}

function AtomCard({
  atom,
  selected,
  onSelect,
  onEdit,
  onCopy,
  onDelete,
}: {
  atom: PromptAtom;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={cn("overflow-hidden", selected && "ring-2 ring-primary")}>
      <CardContent className="flex flex-col gap-3 p-3">
        <button type="button" onClick={onSelect} className="flex flex-col gap-3 text-left">
          <div className="relative">
            <PreviewImage src={atom.previewImagePath} alt={`${atom.title} 預覽圖`} large />
            {selected && (
              <Badge className="absolute right-2 top-2">
                <CheckIcon data-icon="inline-start" />
                已選
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{atom.title}</div>
                <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {atom.subtitle || "未填副標題"}
                </div>
              </div>
              <Badge variant="secondary">{atom.category}</Badge>
            </div>
            <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{atom.prompt}</p>
            {atom.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {atom.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </button>
      </CardContent>
      <CardFooter className="justify-between gap-2 border-t">
        <Button variant={selected ? "secondary" : "default"} size="sm" onClick={onSelect}>
          {selected ? "再次選擇" : "選擇"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" />}>
            <MoreHorizontalIcon />
            <span className="sr-only">素材操作</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onEdit}>
                <PencilIcon />
                編輯素材
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <ClipboardIcon />
                複製素材 Prompt
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2Icon />
                刪除素材
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

function PreviewImage({
  src,
  alt,
  large = false,
}: {
  src: string;
  alt: string;
  large?: boolean;
}) {
  const className = cn(
    "relative flex overflow-hidden rounded-md border bg-muted text-xs text-muted-foreground",
    large ? "aspect-[4/3] w-full" : "aspect-square w-full min-w-0",
  );

  if (!src) {
    return (
      <div className={cn(className, "items-center justify-center text-center")}>
        尚無預覽圖
      </div>
    );
  }

  return (
    <div className={className}>
      <Image src={src} alt={alt} fill sizes={large ? "360px" : "96px"} className="object-cover" unoptimized />
    </div>
  );
}
