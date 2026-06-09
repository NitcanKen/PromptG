"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
  EyeIcon,
  ImagePlusIcon,
  ImagesIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RefreshCcwIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  WandSparklesIcon,
  XIcon,
} from "lucide-react";

import {
  CATEGORIES_BY_GROUP,
  CATEGORY_GROUPS,
  CATEGORY_METADATA_BY_LABEL,
  CATEGORY_SELECTION_MODE,
  DEFAULT_LOCK_POLICY,
  DEFAULT_CATEGORY,
  DEFAULT_PROMPT_PRIORITY,
  DEFAULT_MIMO_MODEL,
  LOCK_POLICIES,
  LOCK_POLICY_DESCRIPTIONS,
  LOCK_POLICY_LABELS,
  MIMO_MODELS,
  PROMPT_PRIORITIES,
  PROMPT_PRIORITY_DESCRIPTIONS,
  PROMPT_PRIORITY_LABELS,
  QUALITY_PRESETS,
  SIZE_PRESETS,
  type Category,
  type CategoryGroup,
  type LockPolicy,
  type MimoModel,
  type PromptPriority,
  type QualityPresetId,
  type SizePresetId,
} from "@/lib/constants";
import {
  countAtomsByCategory,
  countAtomsForCategories,
  type CategoryAtomCounts,
} from "@/lib/atoms/category-counts";
import { getVisibleTags } from "@/lib/atoms/tag-display";
import { compilePrompt } from "@/lib/prompt/compiler";
import { cn } from "@/lib/utils";
import {
  useCurrentCombinationStore,
  type CompilerMode,
  type CurrentCombinationSnapshot,
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

type GalleryItem = {
  id: string;
  title: string;
  previewImagePath: string;
  prompt: string;
  sizePreset: SizePresetId;
  qualityPreset: QualityPresetId;
  tags: string[];
  notes: string;
  combinationSnapshot: CurrentCombinationSnapshot | null;
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
  priority: PromptPriority;
  lockPolicy: LockPolicy;
  tagsText: string;
  notes: string;
};

type GalleryFormState = {
  id?: string;
  title: string;
  previewImagePath: string;
  prompt: string;
  sizePreset: SizePresetId;
  qualityPreset: QualityPresetId;
  tagsText: string;
  notes: string;
  combinationSnapshot: CurrentCombinationSnapshot | null;
};

type ParsedDraft = {
  localId: string;
  selected: boolean;
  category: Category;
  title: string;
  subtitle: string;
  prompt: string;
  negativePrompt: string;
  priority: PromptPriority;
  lockPolicy: LockPolicy;
  tagsText: string;
  notes: string;
};

const emptyAtomForm: AtomFormState = {
  category: DEFAULT_CATEGORY,
  title: "",
  subtitle: "",
  previewImagePath: "",
  prompt: "",
  negativePrompt: "",
  priority: DEFAULT_PROMPT_PRIORITY,
  lockPolicy: DEFAULT_LOCK_POLICY,
  tagsText: "",
  notes: "",
};

const emptyGalleryForm: GalleryFormState = {
  title: "",
  previewImagePath: "",
  prompt: "",
  sizePreset: "auto",
  qualityPreset: "auto",
  tagsText: "",
  notes: "",
  combinationSnapshot: null,
};

function splitTags(tagsText: string) {
  return tagsText
    .split(/[、,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function categoryGroupOf(category: Category): CategoryGroup {
  return CATEGORY_METADATA_BY_LABEL[category].group;
}

function categoriesInGroup(group: CategoryGroup) {
  return CATEGORIES_BY_GROUP[group];
}

function atomToForm(atom?: PromptAtom, category: Category = DEFAULT_CATEGORY): AtomFormState {
  if (!atom) {
    return { ...emptyAtomForm, category };
  }

  return {
    id: atom.id,
    category: atom.category,
    title: atom.title,
    subtitle: atom.subtitle,
    previewImagePath: atom.previewImagePath,
    prompt: atom.prompt,
    negativePrompt: atom.negativePrompt,
    priority: atom.priority,
    lockPolicy: atom.lockPolicy,
    tagsText: atom.tags.join("、"),
    notes: atom.notes,
  };
}

function atomFormPayload(form: AtomFormState) {
  return {
    category: form.category,
    title: form.title,
    subtitle: form.subtitle,
    previewImagePath: form.previewImagePath,
    prompt: form.prompt,
    negativePrompt: form.negativePrompt,
    priority: form.priority,
    lockPolicy: form.lockPolicy,
    tags: splitTags(form.tagsText),
    notes: form.notes,
  };
}

function galleryToForm(item?: GalleryItem, fallback?: GalleryFormState): GalleryFormState {
  if (!item) {
    return fallback ? { ...fallback } : { ...emptyGalleryForm };
  }

  return {
    id: item.id,
    title: item.title,
    previewImagePath: item.previewImagePath,
    prompt: item.prompt,
    sizePreset: item.sizePreset,
    qualityPreset: item.qualityPreset,
    tagsText: item.tags.join("、"),
    notes: item.notes,
    combinationSnapshot: item.combinationSnapshot,
  };
}

function galleryFormPayload(form: GalleryFormState) {
  return {
    title: form.title,
    previewImagePath: form.previewImagePath,
    prompt: form.prompt,
    sizePreset: form.sizePreset,
    qualityPreset: form.qualityPreset,
    tags: splitTags(form.tagsText),
    notes: form.notes,
    combinationSnapshot: form.combinationSnapshot,
  };
}

function matchesSearch(atom: PromptAtom, keyword: string) {
  if (!keyword) {
    return true;
  }

  return [atom.title, atom.subtitle, atom.prompt, atom.negativePrompt, atom.notes, ...atom.tags]
    .join(" ")
    .toLowerCase()
    .includes(keyword);
}

function draftToAtomPayload(draft: ParsedDraft) {
  return {
    category: draft.category,
    title: draft.title,
    subtitle: draft.subtitle,
    previewImagePath: "",
    prompt: draft.prompt,
    negativePrompt: draft.negativePrompt,
    priority: draft.priority,
    lockPolicy: draft.lockPolicy,
    tags: splitTags(draft.tagsText).slice(0, 8),
    notes: draft.notes,
  };
}

export function PromptWorkbench() {
  const [atoms, setAtoms] = useState<PromptAtom[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoadingAtoms, setIsLoadingAtoms] = useState(true);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [showAllCombinationCategories, setShowAllCombinationCategories] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState("");
  const [selectorTag, setSelectorTag] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isAtomFormOpen, setIsAtomFormOpen] = useState(false);
  const [atomForm, setAtomForm] = useState<AtomFormState>(emptyAtomForm);
  const [atomDetail, setAtomDetail] = useState<PromptAtom | null>(null);
  const [deleteAtomTarget, setDeleteAtomTarget] = useState<PromptAtom | null>(null);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryTag, setGalleryTag] = useState("");
  const [gallerySort, setGallerySort] = useState("created-desc");
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState<GalleryFormState>(emptyGalleryForm);
  const [galleryDetail, setGalleryDetail] = useState<GalleryItem | null>(null);
  const [deleteGalleryTarget, setDeleteGalleryTarget] = useState<GalleryItem | null>(null);
  const [mimoModel, setMimoModelState] = useState<MimoModel>(DEFAULT_MIMO_MODEL);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importPrompt, setImportPrompt] = useState("");
  const [parseError, setParseError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedDrafts, setParsedDrafts] = useState<ParsedDraft[]>([]);
  const [isConfirmParsedOpen, setIsConfirmParsedOpen] = useState(false);

  const {
    selectedAtoms,
    sizePreset,
    qualityPreset,
    compilerMode,
    customPrompt,
    selectAtom,
    removeAtom,
    clearCategory,
    applyGalleryItem,
    setSizePreset,
    setQualityPreset,
    setCompilerMode,
    setCustomPrompt,
    reset,
  } = useCurrentCombinationStore();

  const compiledPrompt = useMemo(
    () => compilePrompt({ selectedAtoms, sizePreset, qualityPreset }),
    [qualityPreset, selectedAtoms, sizePreset],
  );
  const promptText = compilerMode === "auto" ? compiledPrompt.positivePrompt : customPrompt;
  const negativePromptText = compilerMode === "auto" ? compiledPrompt.negativePrompt : "";
  const combinedPromptText =
    compilerMode === "auto" ? compiledPrompt.combinedPrompt : customPrompt;
  const selectedCount = Object.values(selectedAtoms).reduce(
    (total, items) => total + (items?.length ?? 0),
    0,
  );
  const categoryAtomCounts = useMemo(() => countAtomsByCategory(atoms), [atoms]);
  const currentSnapshot = useMemo<CurrentCombinationSnapshot | null>(() => {
    if (selectedCount === 0) {
      return null;
    }

    return { selectedAtoms, sizePreset, qualityPreset };
  }, [qualityPreset, selectedAtoms, selectedCount, sizePreset]);
  const selectorKeyword = selectorSearch.trim().toLowerCase();
  const selectorTags = useMemo(() => {
    const tags = new Set<string>();
    atoms
      .filter((atom) =>
        selectorKeyword ? matchesSearch(atom, selectorKeyword) : atom.category === activeCategory,
      )
      .forEach((atom) => atom.tags.forEach((tag) => tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  }, [activeCategory, atoms, selectorKeyword]);
  const selectorAtoms = useMemo(
    () =>
      atoms.filter(
        (atom) =>
          (selectorKeyword ? matchesSearch(atom, selectorKeyword) : atom.category === activeCategory) &&
          matchesSearch(atom, selectorKeyword) &&
          (!selectorTag || atom.tags.includes(selectorTag)),
      ),
    [activeCategory, atoms, selectorKeyword, selectorTag],
  );
  const galleryTags = useMemo(() => {
    const tags = new Set<string>();
    galleryItems.forEach((item) => item.tags.forEach((tag) => tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  }, [galleryItems]);

  useEffect(() => {
    void loadAtoms();
    void loadGallery();
    void loadMimoModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAtoms() {
    const response = await fetch("/api/atoms");
    const data = (await response.json().catch(() => null)) as { atoms?: PromptAtom[]; error?: string } | null;

    if (!response.ok || !data?.atoms) {
      toast.error(data?.error ?? "讀取素材失敗");
      setIsLoadingAtoms(false);
      return;
    }

    setAtoms(data.atoms);
    setIsLoadingAtoms(false);
  }

  async function loadGallery() {
    const params = new URLSearchParams();
    if (gallerySearch.trim()) params.set("q", gallerySearch.trim());
    if (galleryTag) params.set("tag", galleryTag);
    params.set("sort", gallerySort);

    const response = await fetch(`/api/gallery?${params.toString()}`);
    const data = (await response.json().catch(() => null)) as { items?: GalleryItem[]; error?: string } | null;

    if (!response.ok || !data?.items) {
      toast.error(data?.error ?? "讀取 Gallery 失敗");
      setIsLoadingGallery(false);
      return;
    }

    setGalleryItems(data.items);
    setIsLoadingGallery(false);
  }

  async function loadMimoModel() {
    const response = await fetch("/api/settings/mimo-model");
    const data = (await response.json().catch(() => null)) as { model?: MimoModel } | null;

    if (response.ok && data?.model) {
      setMimoModelState(data.model);
    }
  }

  async function persistMimoModel(model: MimoModel) {
    setMimoModelState(model);
    const response = await fetch("/api/settings/mimo-model", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model }),
    });

    if (!response.ok) {
      toast.error("Mimo 模型保存失敗");
      return;
    }

    toast.success("Mimo 模型已保存");
  }

  function openSelector(category = activeCategory) {
    setActiveCategory(category);
    setSelectorTag("");
    setIsSelectorOpen(true);
  }

  function openCreateAtom(category = activeCategory) {
    setAtomForm(atomToForm(undefined, category));
    setIsAtomFormOpen(true);
  }

  function openEditAtom(atom: PromptAtom) {
    setAtomForm(atomToForm(atom));
    setIsAtomFormOpen(true);
  }

  function openSaveGalleryForm() {
    const fallback: GalleryFormState = {
      ...emptyGalleryForm,
      title: "未命名 Prompt",
      prompt: combinedPromptText,
      sizePreset,
      qualityPreset,
      combinationSnapshot: currentSnapshot,
    };
    setGalleryForm(galleryToForm(undefined, fallback));
    setIsGalleryFormOpen(true);
  }

  function openEditGallery(item: GalleryItem) {
    setGalleryForm(galleryToForm(item));
    setIsGalleryFormOpen(true);
  }

  async function uploadImage(file: File | null, onPath: (path: string) => void) {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: formData });
    const data = (await response.json().catch(() => null)) as { path?: string; error?: string } | null;

    if (!response.ok || !data?.path) {
      toast.error(data?.error ?? "圖片上傳失敗");
      return;
    }

    onPath(data.path);
    toast.success("圖片已上傳");
  }

  async function handleSaveAtom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch(atomForm.id ? `/api/atoms/${atomForm.id}` : "/api/atoms", {
      method: atomForm.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atomFormPayload(atomForm)),
    });
    const data = (await response.json().catch(() => null)) as { atom?: PromptAtom; error?: string } | null;
    setIsSaving(false);

    if (!response.ok || !data?.atom) {
      toast.error(data?.error ?? "保存素材失敗");
      return;
    }

    const savedAtom = data.atom;
    setAtoms((current) =>
      atomForm.id
        ? current.map((atom) => (atom.id === savedAtom.id ? savedAtom : atom))
        : [savedAtom, ...current],
    );
    setIsAtomFormOpen(false);
    toast.success(atomForm.id ? "素材已更新" : "素材已建立");
  }

  async function handleDeleteAtom() {
    if (!deleteAtomTarget) return;

    const response = await fetch(`/api/atoms/${deleteAtomTarget.id}`, { method: "DELETE" });

    if (!response.ok) {
      toast.error("刪除素材失敗");
      return;
    }

    setAtoms((current) => current.filter((atom) => atom.id !== deleteAtomTarget.id));
    removeAtom(deleteAtomTarget.category, deleteAtomTarget.id);
    setDeleteAtomTarget(null);
    toast.success("素材已刪除");
  }

  async function handleSaveGallery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const response = await fetch(
      galleryForm.id ? `/api/gallery/${galleryForm.id}` : "/api/gallery",
      {
        method: galleryForm.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(galleryFormPayload(galleryForm)),
      },
    );
    const data = (await response.json().catch(() => null)) as { item?: GalleryItem; error?: string } | null;
    setIsSaving(false);

    if (!response.ok || !data?.item) {
      toast.error(data?.error ?? "保存 Gallery 失敗");
      return;
    }

    const savedItem = data.item;
    setGalleryItems((current) =>
      galleryForm.id
        ? current.map((item) => (item.id === savedItem.id ? savedItem : item))
        : [savedItem, ...current],
    );
    setIsGalleryFormOpen(false);
    toast.success(galleryForm.id ? "Gallery 已更新" : "已保存到 Gallery");
  }

  async function handleDeleteGallery() {
    if (!deleteGalleryTarget) return;

    const response = await fetch(`/api/gallery/${deleteGalleryTarget.id}`, { method: "DELETE" });

    if (!response.ok) {
      toast.error("刪除 Gallery 失敗");
      return;
    }

    setGalleryItems((current) => current.filter((item) => item.id !== deleteGalleryTarget.id));
    setDeleteGalleryTarget(null);
    toast.success("Gallery 項目已刪除");
  }

  async function copyText(text: string, emptyMessage: string, successMessage: string) {
    if (!text.trim()) {
      toast.warning(emptyMessage);
      return;
    }

    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  }

  function updateCompilerMode(value: string[]) {
    const nextMode = value[0] as CompilerMode | undefined;
    if (!nextMode) return;
    if (nextMode === "custom" && compilerMode === "auto") setCustomPrompt(combinedPromptText);
    setCompilerMode(nextMode);
  }

  function applyGallery(item: GalleryItem) {
    if (item.combinationSnapshot) {
      applyGalleryItem(item);
      toast.success("已還原 Gallery 組合");
      return;
    }

    applyGalleryItem(item);
    toast.success("已載入自定義 Prompt");
  }

  async function parsePrompt() {
    setParseError("");
    setIsParsing(true);

    const response = await fetch("/api/prompt/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: importPrompt, model: mimoModel }),
    });
    const data = (await response.json().catch(() => null)) as
      | { items?: Array<Omit<ParsedDraft, "localId" | "selected" | "tagsText"> & { tags: string[] }>; error?: string }
      | null;
    setIsParsing(false);

    if (!response.ok || !data?.items) {
      setParseError(data?.error ?? "Prompt 拆解失敗，請稍後再試");
      return;
    }

    setParsedDrafts(
      data.items.map((item, index) => ({
        localId: `${Date.now()}-${index}`,
        selected: true,
        category: item.category,
        title: item.title,
        subtitle: item.subtitle,
        prompt: item.prompt,
        negativePrompt: item.negativePrompt,
        priority: DEFAULT_PROMPT_PRIORITY,
        lockPolicy: DEFAULT_LOCK_POLICY,
        tagsText: item.tags.join("、"),
        notes: item.notes,
      })),
    );
    setIsConfirmParsedOpen(true);
    toast.success("已完成拆解，請確認後再保存");
  }

  async function saveParsedDraft(draft: ParsedDraft) {
    const response = await fetch("/api/atoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draftToAtomPayload(draft)),
    });
    const data = (await response.json().catch(() => null)) as { atom?: PromptAtom; error?: string } | null;

    if (!response.ok || !data?.atom) {
      toast.error(data?.error ?? "保存拆解素材失敗");
      return false;
    }

    setAtoms((current) => [data.atom as PromptAtom, ...current]);
    setParsedDrafts((current) => current.filter((item) => item.localId !== draft.localId));
    toast.success(`已保存「${data.atom.title}」`);
    return true;
  }

  async function saveSelectedParsedDrafts() {
    const selected = parsedDrafts.filter((draft) => draft.selected);

    if (selected.length === 0) {
      toast.warning("請先勾選要保存的素材");
      return;
    }

    for (const draft of selected) {
      const ok = await saveParsedDraft(draft);
      if (!ok) return;
    }
  }

  function updateDraft(localId: string, patch: Partial<ParsedDraft>) {
    setParsedDrafts((current) =>
      current.map((draft) => (draft.localId === localId ? { ...draft, ...patch } : draft)),
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-4 px-4 py-4 md:px-6">
        <header className="flex flex-col gap-3 border-b pb-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">
              Prompt 視覺化素材工作台
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              管理、拆解、選擇與重組圖片 Prompt 素材；本工具不生成圖片。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">已啟用 {selectedCount} 個素材</Badge>
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
              <WandSparklesIcon data-icon="inline-start" />
              粘貼 Prompt 導入
            </Button>
            <Button variant="outline" size="sm" onClick={() => openSaveGalleryForm()}>
              <SaveIcon data-icon="inline-start" />
              保存 Gallery
            </Button>
            <Button size="sm" onClick={() => openSelector(activeCategory)}>
              <ImagesIcon data-icon="inline-start" />
              大圖選擇
            </Button>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_500px]">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>創作參數</CardTitle>
                <CardDescription>尺寸與質量只會寫入 Prompt，不會觸發圖片生成。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[minmax(240px,420px)_1fr_minmax(220px,320px)]">
                <Field>
                  <FieldLabel htmlFor="size-preset">尺寸</FieldLabel>
                  <Select
                    items={SIZE_PRESETS.map((preset) => ({ label: preset.label, value: preset.id }))}
                    value={sizePreset}
                    onValueChange={(value) => value && setSizePreset(value as SizePresetId)}
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
                    onValueChange={(value) => value[0] && setQualityPreset(value[0] as QualityPresetId)}
                    variant="outline"
                    size="sm"
                    className="flex-wrap justify-start"
                  >
                    {QUALITY_PRESETS.map((preset) => (
                      <ToggleGroupItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="mimo-model">Mimo 模型</FieldLabel>
                  <Select
                    items={MIMO_MODELS.map((model) => ({ label: model, value: model }))}
                    value={mimoModel}
                    onValueChange={(value) => value && void persistMimoModel(value as MimoModel)}
                  >
                    <SelectTrigger id="mimo-model" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {MIMO_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle>當前組合</CardTitle>
                    <CardDescription>按分類群組管理素材；點擊分類槽位可打開大圖選擇器。</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllCombinationCategories((current) => !current)}
                    >
                      {showAllCombinationCategories ? "只顯示已選分類" : "顯示全部分類"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openCreateAtom(activeCategory)}>
                      <ImagePlusIcon data-icon="inline-start" />
                      建立目前分類素材
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openSelector(activeCategory)}>
                      <ImagesIcon data-icon="inline-start" />
                      大圖選擇
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {CATEGORY_GROUPS.map((group) => {
                  const groupCategories = categoriesInGroup(group);
                  const visibleCategories = showAllCombinationCategories
                    ? groupCategories
                    : groupCategories.filter((category) => (selectedAtoms[category]?.length ?? 0) > 0);
                  const selectedInGroup = groupCategories.reduce(
                    (total, category) => total + (selectedAtoms[category]?.length ?? 0),
                    0,
                  );

                  return (
                    <section key={group} className="rounded-lg border bg-card">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">{group}</h3>
                          <Badge variant="secondary">{selectedInGroup} 個已選</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSelector(groupCategories[0])}
                        >
                          <ImagesIcon data-icon="inline-start" />
                          打開群組
                        </Button>
                      </div>
                      <div className="grid gap-2 p-3 md:grid-cols-2 2xl:grid-cols-3">
                        {visibleCategories.length > 0 ? (
                          visibleCategories.map((category) => (
                            <CategorySlot
                              key={category}
                              category={category}
                              selected={selectedAtoms[category] ?? []}
                              onOpen={() => openSelector(category)}
                              onCreate={() => openCreateAtom(category)}
                              onRemove={(atomId) => removeAtom(category, atomId)}
                            />
                          ))
                        ) : (
                          <div className="rounded-md border border-dashed bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
                            尚未選擇此群組素材。
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })}
              </CardContent>
            </Card>

            <GallerySection
              items={galleryItems}
              isLoading={isLoadingGallery}
              search={gallerySearch}
              tag={galleryTag}
              tags={galleryTags}
              sort={gallerySort}
              onSearchChange={setGallerySearch}
              onTagChange={setGalleryTag}
              onSortChange={setGallerySort}
              onRefresh={() => {
                setIsLoadingGallery(true);
                void loadGallery();
              }}
              onSave={openSaveGalleryForm}
              onCopy={(item) => void copyText(item.prompt, "此 Gallery 沒有 Prompt", "Gallery Prompt 已複製")}
              onDetail={setGalleryDetail}
              onEdit={openEditGallery}
              onDelete={setDeleteGalleryTarget}
              onApply={applyGallery}
              onParse={(prompt) => {
                setImportPrompt(prompt);
                setParseError("");
                setIsImportOpen(true);
              }}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Prompt 編譯器</CardTitle>
                <CardDescription>自動模式會分離正向與 Negative Prompt；自定義模式不會被素材覆蓋。</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ToggleGroup value={[compilerMode]} onValueChange={updateCompilerMode} variant="outline" size="sm">
                  <ToggleGroupItem value="auto">自動</ToggleGroupItem>
                  <ToggleGroupItem value="custom">自定義</ToggleGroupItem>
                </ToggleGroup>
                <Field>
                  <FieldLabel htmlFor="compiled-positive">Prompt</FieldLabel>
                  <Textarea
                    id="compiled-positive"
                    value={promptText}
                    onChange={(event) => setCustomPrompt(event.target.value)}
                    readOnly={compilerMode === "auto"}
                    className="min-h-[260px] resize-y font-mono text-sm leading-6"
                    placeholder="選擇素材後會自動生成完整 Prompt"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="compiled-negative">Negative Prompt</FieldLabel>
                  <Textarea
                    id="compiled-negative"
                    value={negativePromptText}
                    readOnly
                    className="min-h-24 resize-y font-mono text-sm leading-6"
                    placeholder="選擇 Negative Atom 或帶有 Negative Prompt 的素材後會自動生成"
                  />
                </Field>
              </CardContent>
              <CardFooter className="flex-wrap justify-end gap-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    reset();
                    toast.success("當前組合已重置");
                  }}
                >
                  <RefreshCcwIcon data-icon="inline-start" />
                  重置
                </Button>
                <Button onClick={() => void copyText(promptText, "目前沒有可複製的 Prompt", "Prompt 已複製")}>
                  <ClipboardIcon data-icon="inline-start" />
                  複製 Prompt
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    void copyText(
                      negativePromptText,
                      "目前沒有可複製的 Negative Prompt",
                      "Negative Prompt 已複製",
                    )
                  }
                >
                  <ClipboardIcon data-icon="inline-start" />
                  複製 Negative Prompt
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    void copyText(
                      combinedPromptText,
                      "目前沒有可複製的完整 Prompt",
                      "完整 Prompt 已複製",
                    )
                  }
                >
                  <ClipboardIcon data-icon="inline-start" />
                  複製完整 Prompt
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle>素材概覽</CardTitle>
                <CardDescription>目前素材庫共 {atoms.length} 個素材。</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button className="w-full" onClick={() => openSelector(activeCategory)}>
                  <ImagesIcon data-icon="inline-start" />
                  打開大圖選擇器
                </Button>
                <div className="flex flex-col gap-3 text-sm">
                  {CATEGORY_GROUPS.map((group) => (
                    <section key={group} className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-muted-foreground">{group}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {categoriesInGroup(group).map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => openSelector(category)}
                            className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left hover:bg-accent"
                          >
                            <span className="min-w-0 truncate">{category}</span>
                            <Badge variant="secondary">
                              {categoryAtomCounts[category]}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <BigSelectorDialog
        open={isSelectorOpen}
        activeCategory={activeCategory}
        search={selectorSearch}
        tag={selectorTag}
        tags={selectorTags}
        atoms={selectorAtoms}
        categoryAtomCounts={categoryAtomCounts}
        selectedAtoms={selectedAtoms}
        isLoading={isLoadingAtoms}
        onOpenChange={setIsSelectorOpen}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setSelectorTag("");
        }}
        onSearchChange={setSelectorSearch}
        onTagChange={setSelectorTag}
        onCreate={() => openCreateAtom(activeCategory)}
        onImport={() => setIsImportOpen(true)}
        onSelect={selectAtom}
        onUnselect={(atom) => removeAtom(atom.category, atom.id)}
        onView={setAtomDetail}
        onEdit={openEditAtom}
        onCopy={(atom) => void copyText(atom.prompt, "此素材沒有 Prompt", "素材 Prompt 已複製")}
        onDelete={setDeleteAtomTarget}
        onClearCategory={() => clearCategory(activeCategory)}
        onClearAll={() => {
          reset();
          toast.success("已清空全部分類");
        }}
      />

      <AtomFormDialog
        open={isAtomFormOpen}
        form={atomForm}
        isSaving={isSaving}
        onOpenChange={setIsAtomFormOpen}
        onFormChange={setAtomForm}
        onUpload={(file) =>
          void uploadImage(file, (path) =>
            setAtomForm((current) => ({ ...current, previewImagePath: path })),
          )
        }
        onSubmit={handleSaveAtom}
      />

      <GalleryFormDialog
        open={isGalleryFormOpen}
        form={galleryForm}
        isSaving={isSaving}
        onOpenChange={setIsGalleryFormOpen}
        onFormChange={setGalleryForm}
        onUpload={(file) =>
          void uploadImage(file, (path) =>
            setGalleryForm((current) => ({ ...current, previewImagePath: path })),
          )
        }
        onSubmit={handleSaveGallery}
      />

      <PromptImportDialog
        open={isImportOpen}
        prompt={importPrompt}
        model={mimoModel}
        error={parseError}
        isParsing={isParsing}
        onOpenChange={setIsImportOpen}
        onPromptChange={setImportPrompt}
        onModelChange={(model) => void persistMimoModel(model)}
        onParse={() => void parsePrompt()}
      />

      <ConfirmParsedDialog
        open={isConfirmParsedOpen}
        sourcePrompt={importPrompt}
        drafts={parsedDrafts}
        onOpenChange={setIsConfirmParsedOpen}
        onDraftChange={updateDraft}
        onRemove={(localId) => setParsedDrafts((current) => current.filter((draft) => draft.localId !== localId))}
        onSaveOne={(draft) => void saveParsedDraft(draft)}
        onSaveSelected={() => void saveSelectedParsedDrafts()}
      />

      <AtomDetailDialog atom={atomDetail} onOpenChange={(open) => !open && setAtomDetail(null)} />
      <GalleryDetailDialog
        item={galleryDetail}
        onOpenChange={(open) => !open && setGalleryDetail(null)}
        onCopy={(item) => void copyText(item.prompt, "此 Gallery 沒有 Prompt", "Gallery Prompt 已複製")}
        onApply={applyGallery}
        onParse={(prompt) => {
          setImportPrompt(prompt);
          setParseError("");
          setIsImportOpen(true);
        }}
      />

      <AlertDialog open={Boolean(deleteAtomTarget)} onOpenChange={(open) => !open && setDeleteAtomTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除素材？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作會從素材庫移除「{deleteAtomTarget?.title}」，也會從當前組合取消選擇。
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

      <AlertDialog open={Boolean(deleteGalleryTarget)} onOpenChange={(open) => !open && setDeleteGalleryTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除 Gallery 項目？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作會刪除「{deleteGalleryTarget?.title}」，不會刪除素材庫。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void handleDeleteGallery()}>
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
  const metadata = CATEGORY_METADATA_BY_LABEL[category];

  return (
    <div className={cn("flex min-h-32 flex-col gap-2 rounded-md border bg-background p-3 text-left", selected.length > 0 ? "border-primary/40" : "border-border")}>
      <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }} className="flex flex-1 cursor-pointer flex-col gap-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="block truncate text-sm font-medium">{category}</span>
            <span className="line-clamp-1 text-xs text-muted-foreground">{metadata.description}</span>
          </div>
          <Badge variant="secondary">{mode === "single" ? "單選" : "多選"}</Badge>
        </div>
        {selected.length === 0 ? (
          <div className="flex min-h-16 flex-1 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
            點擊選擇{category}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selected.map((atom) => (
              <div key={atom.id} className="grid grid-cols-[48px_1fr_auto] gap-2 rounded-md bg-muted/40 p-2">
                <PreviewImage src={atom.previewImagePath} alt={`${atom.title} 預覽圖`} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{atom.title}</div>
                  <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">{atom.subtitle || "未填副標題"}</div>
                </div>
                <Button type="button" size="icon-xs" variant="ghost" onClick={(event) => {
                  event.stopPropagation();
                  onRemove(atom.id);
                }} aria-label={`取消選擇${atom.title}`}>
                  <XIcon />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onCreate}>
        <PlusIcon data-icon="inline-start" />
        新增
      </Button>
    </div>
  );
}

function BigSelectorDialog({
  open,
  activeCategory,
  search,
  tag,
  tags,
  atoms,
  categoryAtomCounts,
  selectedAtoms,
  isLoading,
  onOpenChange,
  onCategoryChange,
  onSearchChange,
  onTagChange,
  onCreate,
  onImport,
  onSelect,
  onUnselect,
  onView,
  onEdit,
  onCopy,
  onDelete,
  onClearCategory,
  onClearAll,
}: {
  open: boolean;
  activeCategory: Category;
  search: string;
  tag: string;
  tags: string[];
  atoms: PromptAtom[];
  categoryAtomCounts: CategoryAtomCounts;
  selectedAtoms: Partial<Record<Category, SelectedAtom[]>>;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryChange: (category: Category) => void;
  onSearchChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onCreate: () => void;
  onImport: () => void;
  onSelect: (atom: SelectedAtom) => void;
  onUnselect: (atom: PromptAtom) => void;
  onView: (atom: PromptAtom) => void;
  onEdit: (atom: PromptAtom) => void;
  onCopy: (atom: PromptAtom) => void;
  onDelete: (atom: PromptAtom) => void;
  onClearCategory: () => void;
  onClearAll: () => void;
}) {
  const activeSelected = selectedAtoms[activeCategory] ?? [];
  const selectedCount = Object.values(selectedAtoms).reduce((total, items) => total + (items?.length ?? 0), 0);
  const activeGroup = categoryGroupOf(activeCategory);
  const isGlobalSearch = search.trim().length > 0;
  const tagScopeKey = `${activeCategory}:${search.trim()}`;
  const [tagExpansion, setTagExpansion] = useState({ scopeKey: tagScopeKey, expanded: false });
  const tagsExpanded = tagExpansion.scopeKey === tagScopeKey && tagExpansion.expanded;
  const { visibleTags, hiddenCount, canToggle } = getVisibleTags(tags, tagsExpanded);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94vh] flex-col overflow-y-auto sm:max-w-[min(1480px,96vw)] lg:overflow-hidden">
        <DialogHeader>
          <DialogTitle>大圖選擇器</DialogTitle>
          <DialogDescription>切換分類、搜尋或用標籤篩選素材；選中後會同步到當前組合。</DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[300px_1fr]">
          <aside className="flex min-h-0 flex-col gap-3 border-b pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
            <div className="max-h-64 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0">
              <div className="flex flex-col gap-3">
                {CATEGORY_GROUPS.map((group) => (
                  <section key={group} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{group}</span>
                      <Badge variant={activeGroup === group ? "default" : "secondary"}>
                        {countAtomsForCategories(categoryAtomCounts, categoriesInGroup(group))}
                      </Badge>
                    </div>
                    <div className="grid gap-1">
                      {categoriesInGroup(group).map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => onCategoryChange(category)}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                            activeCategory === category && "border-primary bg-primary/10",
                          )}
                        >
                          <span className="min-w-0 truncate">{category}</span>
                          <Badge variant="secondary">{categoryAtomCounts[category]}</Badge>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </aside>
          <section className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="搜尋標題、副標題、標籤、備註或 Prompt" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={onCreate}>
                  <PlusIcon data-icon="inline-start" />
                  新增素材
                </Button>
                <Button variant="outline" size="sm" onClick={onImport}>
                  <WandSparklesIcon data-icon="inline-start" />
                  粘貼導入
                </Button>
              </div>
            </div>
            <div
              className={cn(
                "rounded-md border bg-background/60 p-2",
                tagsExpanded ? "max-h-40 overflow-y-auto pr-1" : "max-h-24 overflow-hidden",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {isGlobalSearch ? "全部分類搜尋" : `${activeGroup} / ${activeCategory}`}
                </Badge>
                <Button variant={tag ? "outline" : "secondary"} size="sm" onClick={() => onTagChange("")}>全部標籤</Button>
                {visibleTags.map((item) => (
                  <Button key={item} variant={tag === item ? "default" : "outline"} size="sm" onClick={() => onTagChange(item)}>
                    {item}
                  </Button>
                ))}
                {canToggle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={tagsExpanded ? "sticky bottom-0 bg-background" : undefined}
                    onClick={() => setTagExpansion((current) => ({
                      scopeKey: tagScopeKey,
                      expanded: current.scopeKey === tagScopeKey ? !current.expanded : true,
                    }))}
                    aria-expanded={tagsExpanded}
                    aria-label={tagsExpanded ? "收合標籤" : `展開另外 ${hiddenCount} 個標籤`}
                  >
                    {tagsExpanded ? <ChevronUpIcon data-icon="inline-start" /> : <ChevronDownIcon data-icon="inline-start" />}
                    {tagsExpanded ? "收合標籤" : `展開 ${hiddenCount}`}
                  </Button>
                )}
              </div>
            </div>
            <div className="min-h-[420px] overflow-visible lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-80 rounded-lg" />)}
                </div>
              ) : atoms.length === 0 ? (
                <Empty className="min-h-80 rounded-lg border">
                  <EmptyHeader>
                    <EmptyTitle>尚無符合條件的素材</EmptyTitle>
                    <EmptyDescription>可以新增素材，或清除搜尋與標籤篩選。</EmptyDescription>
                  </EmptyHeader>
                  <Button onClick={onCreate} size="sm">
                    <PlusIcon data-icon="inline-start" />
                    新增素材
                  </Button>
                </Empty>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {atoms.map((atom) => {
                    const selected = (selectedAtoms[atom.category] ?? []).some((item) => item.id === atom.id);
                    return (
                      <AtomCard
                        key={atom.id}
                        atom={atom}
                        selected={selected}
                        onSelect={() => onSelect(atom)}
                        onUnselect={() => onUnselect(atom)}
                        onView={() => onView(atom)}
                        onEdit={() => onEdit(atom)}
                        onCopy={() => onCopy(atom)}
                        onDelete={() => onDelete(atom)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter className="flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {activeCategory} 已選 {activeSelected.length} 個，全部分類共 {selectedCount} 個
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={onClearCategory}>清空分類</Button>
                <Button variant="outline" onClick={onClearAll}>清空全部</Button>
                <Button onClick={() => onOpenChange(false)}>完成</Button>
              </div>
            </DialogFooter>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AtomCard({
  atom,
  selected,
  onSelect,
  onUnselect,
  onView,
  onEdit,
  onCopy,
  onDelete,
}: {
  atom: PromptAtom;
  selected: boolean;
  onSelect: () => void;
  onUnselect: () => void;
  onView: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={cn("overflow-hidden", selected && "ring-2 ring-primary")}>
      <CardContent className="flex flex-col gap-3 p-3">
        <button type="button" onClick={selected ? onUnselect : onSelect} className="flex flex-col gap-3 text-left">
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
                <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">{atom.subtitle || "未填副標題"}</div>
              </div>
              <Badge variant="secondary">{atom.category}</Badge>
            </div>
            <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{atom.prompt}</p>
            {atom.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {atom.tags.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
              </div>
            )}
          </div>
        </button>
      </CardContent>
      <CardFooter className="justify-between gap-2 border-t">
        <Button variant={selected ? "secondary" : "default"} size="sm" onClick={selected ? onUnselect : onSelect}>
          {selected ? "取消選擇" : "選擇"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" />}>
            <MoreHorizontalIcon />
            <span className="sr-only">素材操作</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={selected ? onUnselect : onSelect}>{selected ? "取消選擇" : "選擇素材"}</DropdownMenuItem>
              <DropdownMenuItem onClick={onView}><EyeIcon />查看完整 Prompt</DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}><PencilIcon />編輯素材</DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}><ClipboardIcon />複製素材 Prompt</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onDelete}><Trash2Icon />刪除素材</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

function CategoryPicker({
  value,
  onChange,
}: {
  value: Category;
  onChange: (category: Category) => void;
}) {
  const activeGroup = categoryGroupOf(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="分類群組">
        {CATEGORY_GROUPS.map((group) => (
          <Button
            key={group}
            type="button"
            variant={activeGroup === group ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(categoriesInGroup(group)[0])}
          >
            {group}
          </Button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2" id="atom-category">
        {categoriesInGroup(activeGroup).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={cn(
              "rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
              value === category && "border-primary bg-primary/10",
            )}
          >
            <span className="block font-medium">{category}</span>
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {CATEGORY_METADATA_BY_LABEL[category].description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AtomFormDialog({
  open,
  form,
  isSaving,
  onOpenChange,
  onFormChange,
  onUpload,
  onSubmit,
}: {
  open: boolean;
  form: AtomFormState;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: React.Dispatch<React.SetStateAction<AtomFormState>>;
  onUpload: (file: File | null) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{form.id ? "編輯素材" : "新增素材"}</DialogTitle>
            <DialogDescription>保存分類、預覽圖與 Prompt 正文後，即可在工作台選用。</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="atom-category">分類</FieldLabel>
                <CategoryPicker
                  value={form.category}
                  onChange={(category) =>
                    onFormChange((current) => ({ ...current, category }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="atom-title">標題</FieldLabel>
                <Input id="atom-title" value={form.title} onChange={(event) => onFormChange((current) => ({ ...current, title: event.target.value }))} required />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="atom-subtitle">副標題</FieldLabel>
              <Input id="atom-subtitle" value={form.subtitle} onChange={(event) => onFormChange((current) => ({ ...current, subtitle: event.target.value }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="atom-priority">Prompt 強度</FieldLabel>
                <Select
                  items={PROMPT_PRIORITIES.map((priority) => ({
                    label: PROMPT_PRIORITY_LABELS[priority],
                    value: priority,
                  }))}
                  value={form.priority}
                  onValueChange={(value) =>
                    value &&
                    onFormChange((current) => ({
                      ...current,
                      priority: value as PromptPriority,
                    }))
                  }
                >
                  <SelectTrigger id="atom-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PROMPT_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {PROMPT_PRIORITY_LABELS[priority]}｜{PROMPT_PRIORITY_DESCRIPTIONS[priority]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="atom-lock-policy">覆蓋策略</FieldLabel>
                <Select
                  items={LOCK_POLICIES.map((policy) => ({
                    label: LOCK_POLICY_LABELS[policy],
                    value: policy,
                  }))}
                  value={form.lockPolicy}
                  onValueChange={(value) =>
                    value &&
                    onFormChange((current) => ({
                      ...current,
                      lockPolicy: value as LockPolicy,
                    }))
                  }
                >
                  <SelectTrigger id="atom-lock-policy" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {LOCK_POLICIES.map((policy) => (
                        <SelectItem key={policy} value={policy}>
                          {LOCK_POLICY_LABELS[policy]}｜{LOCK_POLICY_DESCRIPTIONS[policy]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <ImageField id="atom-image" label="預覽圖" value={form.previewImagePath} onChange={(value) => onFormChange((current) => ({ ...current, previewImagePath: value }))} onUpload={onUpload} />
            <TextareaField id="atom-prompt" label="Prompt 正文" value={form.prompt} onChange={(value) => onFormChange((current) => ({ ...current, prompt: value }))} required mono />
            <TextareaField id="atom-negative" label="Negative Prompt" value={form.negativePrompt} onChange={(value) => onFormChange((current) => ({ ...current, negativePrompt: value }))} mono />
            <Field>
              <FieldLabel htmlFor="atom-tags">標籤</FieldLabel>
              <Input id="atom-tags" value={form.tagsText} onChange={(event) => onFormChange((current) => ({ ...current, tagsText: event.target.value }))} placeholder="用頓號或逗號分隔" />
            </Field>
            <TextareaField id="atom-notes" label="備註" value={form.notes} onChange={(value) => onFormChange((current) => ({ ...current, notes: value }))} />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}保存素材</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GalleryFormDialog({
  open,
  form,
  isSaving,
  onOpenChange,
  onFormChange,
  onUpload,
  onSubmit,
}: {
  open: boolean;
  form: GalleryFormState;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: React.Dispatch<React.SetStateAction<GalleryFormState>>;
  onUpload: (file: File | null) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{form.id ? "編輯 Gallery" : "保存到 Gallery"}</DialogTitle>
            <DialogDescription>{form.combinationSnapshot ? "此項目會保存可還原的當前組合 snapshot。" : "沒有素材 snapshot 時，套用後會載入自定義 Prompt 模式。"}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="gallery-title">標題</FieldLabel>
              <Input id="gallery-title" value={form.title} onChange={(event) => onFormChange((current) => ({ ...current, title: event.target.value }))} required />
            </Field>
            <ImageField id="gallery-image" label="Gallery 預覽圖" value={form.previewImagePath} onChange={(value) => onFormChange((current) => ({ ...current, previewImagePath: value }))} onUpload={onUpload} />
            <TextareaField id="gallery-prompt" label="完整 Prompt" value={form.prompt} onChange={(value) => onFormChange((current) => ({ ...current, prompt: value }))} required mono />
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="gallery-size">尺寸</FieldLabel>
                <Select items={SIZE_PRESETS.map((preset) => ({ label: preset.label, value: preset.id }))} value={form.sizePreset} onValueChange={(value) => value && onFormChange((current) => ({ ...current, sizePreset: value as SizePresetId }))}>
                  <SelectTrigger id="gallery-size" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup>{SIZE_PRESETS.map((preset) => <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="gallery-quality">質量</FieldLabel>
                <Select items={QUALITY_PRESETS.map((preset) => ({ label: preset.label, value: preset.id }))} value={form.qualityPreset} onValueChange={(value) => value && onFormChange((current) => ({ ...current, qualityPreset: value as QualityPresetId }))}>
                  <SelectTrigger id="gallery-quality" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup>{QUALITY_PRESETS.map((preset) => <SelectItem key={preset.id} value={preset.id}>{preset.label}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="gallery-tags">標籤</FieldLabel>
              <Input id="gallery-tags" value={form.tagsText} onChange={(event) => onFormChange((current) => ({ ...current, tagsText: event.target.value }))} placeholder="用頓號或逗號分隔" />
            </Field>
            <TextareaField id="gallery-notes" label="備註" value={form.notes} onChange={(value) => onFormChange((current) => ({ ...current, notes: value }))} />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GallerySection({
  items,
  isLoading,
  search,
  tag,
  tags,
  sort,
  onSearchChange,
  onTagChange,
  onSortChange,
  onRefresh,
  onSave,
  onCopy,
  onDetail,
  onEdit,
  onDelete,
  onApply,
  onParse,
}: {
  items: GalleryItem[];
  isLoading: boolean;
  search: string;
  tag: string;
  tags: string[];
  sort: string;
  onSearchChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onRefresh: () => void;
  onSave: () => void;
  onCopy: (item: GalleryItem) => void;
  onDetail: (item: GalleryItem) => void;
  onEdit: (item: GalleryItem) => void;
  onDelete: (item: GalleryItem) => void;
  onApply: (item: GalleryItem) => void;
  onParse: (prompt: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>我的 Gallery</CardTitle>
            <CardDescription>保存完整 Prompt，可複製、編輯、拆解或套用到當前組合。</CardDescription>
          </div>
          <Button size="sm" onClick={onSave}><SaveIcon data-icon="inline-start" />保存目前 Prompt</Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-2 lg:grid-cols-[1fr_220px_auto]">
          <Input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onRefresh()} placeholder="搜尋 Gallery 標題、標籤、備註或 Prompt" />
          <Select items={[{ label: "最新建立", value: "created-desc" }, { label: "最近更新", value: "updated-desc" }, { label: "標題排序", value: "title-asc" }]} value={sort} onValueChange={(value) => value && onSortChange(value)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup><SelectItem value="created-desc">最新建立</SelectItem><SelectItem value="updated-desc">最近更新</SelectItem><SelectItem value="title-asc">標題排序</SelectItem></SelectGroup></SelectContent>
          </Select>
          <Button variant="outline" onClick={onRefresh}>搜尋</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={tag ? "outline" : "secondary"} size="sm" onClick={() => onTagChange("")}>全部標籤</Button>
          {tags.map((item) => <Button key={item} variant={tag === item ? "default" : "outline"} size="sm" onClick={() => onTagChange(item)}>{item}</Button>)}
        </div>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-lg" />)}</div>
        ) : items.length === 0 ? (
          <Empty className="min-h-64 rounded-lg border">
            <EmptyHeader><EmptyTitle>尚無 Gallery</EmptyTitle><EmptyDescription>保存目前 Prompt 後會出現在這裡。</EmptyDescription></EmptyHeader>
            <Button onClick={onSave} size="sm"><SaveIcon data-icon="inline-start" />保存目前 Prompt</Button>
          </Empty>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-3 p-3">
                  <button type="button" onClick={() => onDetail(item)} className="flex flex-col gap-3 text-left">
                    <PreviewImage src={item.previewImagePath} alt={`${item.title} 預覽圖`} large />
                    <div>
                      <div className="truncate text-sm font-semibold">{item.title}</div>
                      <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{item.prompt}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.combinationSnapshot ? <Badge variant="secondary">可還原組合</Badge> : <Badge variant="outline">自定義 Prompt</Badge>}
                      {item.tags.map((itemTag) => <Badge key={itemTag} variant="outline">{itemTag}</Badge>)}
                    </div>
                  </button>
                </CardContent>
                <CardFooter className="justify-between border-t">
                  <Button size="sm" onClick={() => onApply(item)}>套用</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" />}>
                      <MoreHorizontalIcon />
                      <span className="sr-only">Gallery 操作</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onDetail(item)}><EyeIcon />查看詳情</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCopy(item)}><ClipboardIcon />複製 Prompt</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(item)}><PencilIcon />編輯</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onParse(item.prompt)}><WandSparklesIcon />拆解成素材</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}><Trash2Icon />刪除</DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PromptImportDialog({
  open,
  prompt,
  model,
  error,
  isParsing,
  onOpenChange,
  onPromptChange,
  onModelChange,
  onParse,
}: {
  open: boolean;
  prompt: string;
  model: MimoModel;
  error: string;
  isParsing: boolean;
  onOpenChange: (open: boolean) => void;
  onPromptChange: (value: string) => void;
  onModelChange: (model: MimoModel) => void;
  onParse: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>粘貼 Prompt 導入</DialogTitle>
          <DialogDescription>只會送到本機 API route，再由 server 端呼叫小米 Mimo；拆解結果不會自動入庫。</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="parse-model">Mimo 模型</FieldLabel>
            <Select items={MIMO_MODELS.map((item) => ({ label: item, value: item }))} value={model} onValueChange={(value) => value && onModelChange(value as MimoModel)}>
              <SelectTrigger id="parse-model" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup>{MIMO_MODELS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </Field>
          <TextareaField id="source-prompt" label="來源 Prompt" value={prompt} onChange={onPromptChange} required mono />
          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={onParse} disabled={isParsing}>{isParsing ? <Spinner data-icon="inline-start" /> : <WandSparklesIcon data-icon="inline-start" />}開始拆解</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmParsedDialog({
  open,
  sourcePrompt,
  drafts,
  onOpenChange,
  onDraftChange,
  onRemove,
  onSaveOne,
  onSaveSelected,
}: {
  open: boolean;
  sourcePrompt: string;
  drafts: ParsedDraft[];
  onOpenChange: (open: boolean) => void;
  onDraftChange: (localId: string, patch: Partial<ParsedDraft>) => void;
  onRemove: (localId: string) => void;
  onSaveOne: (draft: ParsedDraft) => void;
  onSaveSelected: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-[min(1320px,96vw)]">
        <DialogHeader>
          <DialogTitle>確認拆解素材</DialogTitle>
          <DialogDescription>所有拆解結果都是草稿；請編輯、移除或手動保存。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
          <Field>
            <FieldLabel>來源 Prompt</FieldLabel>
            <Textarea value={sourcePrompt} readOnly className="min-h-[420px] font-mono text-sm leading-6" />
          </Field>
          <div className="flex flex-col gap-3">
            {drafts.length === 0 ? (
              <Empty className="min-h-72 rounded-lg border">
                <EmptyHeader><EmptyTitle>沒有待保存草稿</EmptyTitle><EmptyDescription>已保存或移除所有拆解素材。</EmptyDescription></EmptyHeader>
              </Empty>
            ) : (
              drafts.map((draft) => (
                <Card key={draft.localId}>
                  <CardContent className="grid gap-3 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={draft.selected} onChange={(event) => onDraftChange(draft.localId, { selected: event.target.checked })} />
                        勾選批量保存
                      </label>
                      <Button variant="ghost" size="icon-sm" onClick={() => onRemove(draft.localId)} aria-label="移除草稿"><XIcon /></Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field>
                        <FieldLabel>分類</FieldLabel>
                        <CategoryPicker
                          value={draft.category}
                          onChange={(category) => onDraftChange(draft.localId, { category })}
                        />
                      </Field>
                      <Field><FieldLabel>標題</FieldLabel><Input value={draft.title} onChange={(event) => onDraftChange(draft.localId, { title: event.target.value })} /></Field>
                    </div>
                    <Field><FieldLabel>副標題</FieldLabel><Input value={draft.subtitle} onChange={(event) => onDraftChange(draft.localId, { subtitle: event.target.value })} /></Field>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Prompt 強度</FieldLabel>
                        <Select
                          items={PROMPT_PRIORITIES.map((priority) => ({
                            label: PROMPT_PRIORITY_LABELS[priority],
                            value: priority,
                          }))}
                          value={draft.priority}
                          onValueChange={(value) =>
                            value &&
                            onDraftChange(draft.localId, {
                              priority: value as PromptPriority,
                            })
                          }
                        >
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {PROMPT_PRIORITIES.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {PROMPT_PRIORITY_LABELS[priority]}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>覆蓋策略</FieldLabel>
                        <Select
                          items={LOCK_POLICIES.map((policy) => ({
                            label: LOCK_POLICY_LABELS[policy],
                            value: policy,
                          }))}
                          value={draft.lockPolicy}
                          onValueChange={(value) =>
                            value &&
                            onDraftChange(draft.localId, {
                              lockPolicy: value as LockPolicy,
                            })
                          }
                        >
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {LOCK_POLICIES.map((policy) => (
                                <SelectItem key={policy} value={policy}>
                                  {LOCK_POLICY_LABELS[policy]}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <TextareaField label="Prompt 正文" value={draft.prompt} onChange={(value) => onDraftChange(draft.localId, { prompt: value })} mono />
                    <TextareaField label="Negative Prompt" value={draft.negativePrompt} onChange={(value) => onDraftChange(draft.localId, { negativePrompt: value })} mono />
                    <Field><FieldLabel>標籤</FieldLabel><Input value={draft.tagsText} onChange={(event) => onDraftChange(draft.localId, { tagsText: event.target.value })} /></Field>
                    <TextareaField label="備註" value={draft.notes} onChange={(value) => onDraftChange(draft.localId, { notes: value })} />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => onSaveOne(draft)}><SaveIcon data-icon="inline-start" />保存此素材</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>關閉</Button>
          <Button onClick={onSaveSelected} disabled={drafts.length === 0}><SaveIcon data-icon="inline-start" />批量保存已勾選</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AtomDetailDialog({ atom, onOpenChange }: { atom: PromptAtom | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={Boolean(atom)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{atom?.title}</DialogTitle><DialogDescription>{atom?.subtitle || "未填副標題"}</DialogDescription></DialogHeader>
        {atom && <DetailBody previewImagePath={atom.previewImagePath} prompt={atom.prompt} negativePrompt={atom.negativePrompt} notes={atom.notes} tags={atom.tags} />}
      </DialogContent>
    </Dialog>
  );
}

function GalleryDetailDialog({
  item,
  onOpenChange,
  onCopy,
  onApply,
  onParse,
}: {
  item: GalleryItem | null;
  onOpenChange: (open: boolean) => void;
  onCopy: (item: GalleryItem) => void;
  onApply: (item: GalleryItem) => void;
  onParse: (prompt: string) => void;
}) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{item?.title}</DialogTitle><DialogDescription>{item?.combinationSnapshot ? "此 Gallery 可還原當前組合。" : "此 Gallery 會載入自定義 Prompt 模式。"}</DialogDescription></DialogHeader>
        {item && (
          <>
            <DetailBody previewImagePath={item.previewImagePath} prompt={item.prompt} negativePrompt="" notes={item.notes} tags={item.tags} />
            <DialogFooter>
              <Button variant="outline" onClick={() => onCopy(item)}><ClipboardIcon data-icon="inline-start" />複製</Button>
              <Button variant="outline" onClick={() => onParse(item.prompt)}><WandSparklesIcon data-icon="inline-start" />拆解</Button>
              <Button onClick={() => onApply(item)}>套用到當前組合</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailBody({
  previewImagePath,
  prompt,
  negativePrompt,
  notes,
  tags,
}: {
  previewImagePath: string;
  prompt: string;
  negativePrompt: string;
  notes: string;
  tags: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <PreviewImage src={previewImagePath} alt="預覽圖" large />
      <TextareaField label="Prompt 正文" value={prompt} onChange={() => undefined} mono readOnly />
      {negativePrompt && <TextareaField label="Negative Prompt" value={negativePrompt} onChange={() => undefined} mono readOnly />}
      {tags.length > 0 && <div className="flex flex-wrap gap-1">{tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>}
      {notes && <TextareaField label="備註" value={notes} onChange={() => undefined} readOnly />}
    </div>
  );
}

function ImageField({
  id,
  label,
  value,
  onChange,
  onUpload,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File | null) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <PreviewImage src={value} alt={`${label}預覽`} />
        <div className="flex flex-col gap-2">
          <Input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onUpload(event.target.files?.[0] ?? null)} />
          <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="上傳後自動填入圖片路徑" />
          <FieldDescription>圖片會保存到 data/uploads/，素材只保存相對路徑。</FieldDescription>
        </div>
      </div>
    </Field>
  );
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  required,
  mono,
  readOnly,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  mono?: boolean;
  readOnly?: boolean;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} required={required} readOnly={readOnly} className={cn("min-h-24 text-sm leading-6", mono && "font-mono")} />
    </Field>
  );
}

function PreviewImage({ src, alt, large = false }: { src: string; alt: string; large?: boolean }) {
  const className = cn("relative flex overflow-hidden rounded-md border bg-muted text-xs text-muted-foreground", large ? "aspect-[4/3] w-full" : "aspect-square w-full min-w-0");

  if (!src) {
    return <div className={cn(className, "items-center justify-center text-center")}>尚無預覽圖</div>;
  }

  return (
    <div className={className}>
      <Image src={src} alt={alt} fill sizes={large ? "360px" : "96px"} className="object-cover" unoptimized />
    </div>
  );
}
