import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInspectionExecution, useInspectionActions } from "@/hooks/useInspections";
import { useChecklistItems, useExecutionAnswers, useSaveAnswer, useRemoveAnswerPhoto } from "@/hooks/useInspectionsField";
import { useSignedUrls } from "@/hooks/useSignedUrl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, Check, X, MinusCircle, AlertTriangle, MapPin, Loader2, FileSignature } from "lucide-react";
import { RESPONSE_TYPES } from "@/lib/inspection-assets";
import { SignExecutionModal } from "@/components/inspecoes/SignExecutionModal";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function InspecaoCampo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: execution } = useInspectionExecution(id ?? null);
  const { data: items = [] } = useChecklistItems(execution?.model_id ?? null);
  const { data: answers = [] } = useExecutionAnswers(id ?? null);
  const { data: actions = [] } = useInspectionActions(id ?? null);
  const saveAnswer = useSaveAnswer();
  const removePhoto = useRemoveAnswerPhoto();
  const [signOpen, setSignOpen] = useState(false);
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [gpsRequested, setGpsRequested] = useState(false);

  usePageTitle("Inspeção em campo — Evita HSE", { noindex: true });

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => { setCoords(p.coords); setGpsRequested(true); },
      () => setGpsRequested(true),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  const answersMap = useMemo(() => {
    const m: Record<string, any> = {};
    answers.forEach((a: any) => { m[a.item_id] = a; });
    return m;
  }, [answers]);

  const allPhotoPaths = useMemo(() => {
    const paths: string[] = [];
    answers.forEach((a: any) => (a.photo_urls || []).forEach((p: string) => paths.push(p)));
    return paths;
  }, [answers]);
  const signedPhotos = useSignedUrls("inspection-files", allPhotoPaths);

  const answered = items.filter((it: any) => answersMap[it.id] !== undefined).length;
  const total = items.length;
  const criticalPending = items.filter((it: any) => it.is_critical && !answersMap[it.id]).length;
  const criticalNonConform = items.filter((it: any) => it.is_critical && answersMap[it.id]?.is_conformant === false).length;
  const openActions = actions.filter((a: any) => a.status !== "completed").length;

  const isCompleted = execution?.status === "completed" || execution?.status === "completed_with_issues";
  const canFinish = !isCompleted && total > 0 && criticalPending === 0;

  if (!execution) {
    return <div className="p-6 text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      <div className="flex items-center gap-2 sticky top-0 bg-background z-10 py-3 -mx-4 px-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/inspecoes/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">{execution.reference}</h1>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            {coords
              ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} (±${Math.round(coords.accuracy)}m)`
              : gpsRequested ? "GPS indisponível" : "Obtendo GPS…"}
          </div>
        </div>
        {isCompleted && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluída</Badge>}
      </div>

      {total === 0 ? (
        <div className="text-center py-16 space-y-3 px-6">
          <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
          <p className="text-sm text-muted-foreground">
            Este modelo ainda não tem itens de checklist. Adicione perguntas no cadastro do modelo antes de fazer a inspeção em campo.
          </p>
          <Button variant="outline" onClick={() => navigate(`/inspecoes/${id}`)}>Voltar</Button>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{answered} de {total} respondidos</span>
              {criticalNonConform > 0 && <span className="text-red-600 font-medium">{criticalNonConform} crítico(s) não conforme</span>}
            </div>
            <Progress value={total > 0 ? (answered / total) * 100 : 0} className="h-2" />
          </div>

          {items.map((it: any, idx: number) => (
            <ItemBlock
              key={it.id}
              index={idx + 1}
              item={it}
              answer={answersMap[it.id]}
              signedPhotos={signedPhotos}
              coords={coords}
              disabled={isCompleted}
              onSave={(v) => saveAnswer.mutate({
                execution_id: id!,
                item_id: it.id,
                answer_value: v.answer_value,
                is_conformant: v.is_conformant,
                note: v.note,
                photos: v.photos,
                location: coords,
              })}
              onRemovePhoto={(path) => removePhoto.mutate({ execution_id: id!, item_id: it.id, path })}
            />
          ))}

          {!isCompleted && (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 shadow-lg">
              <div className="max-w-2xl mx-auto flex items-center gap-3">
                <div className="flex-1 text-xs">
                  {criticalPending > 0 && <span className="text-red-600 font-medium">Faltam {criticalPending} item(s) crítico(s)</span>}
                  {criticalPending === 0 && answered < total && <span className="text-muted-foreground">Todos os críticos respondidos</span>}
                  {criticalPending === 0 && answered === total && <span className="text-green-700 font-medium">Checklist completo</span>}
                </div>
                <Button onClick={() => setSignOpen(true)} disabled={!canFinish} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSignature className="h-4 w-4 mr-1.5" />
                  Fechar e assinar
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <SignExecutionModal
        open={signOpen}
        onOpenChange={setSignOpen}
        executionId={id!}
        hasOpenActions={openActions > 0 || criticalNonConform > 0}
        criticalNonConformCount={criticalNonConform}
        onSigned={() => navigate(`/inspecoes/${id}`)}
      />
    </div>
  );
}

interface ItemBlockProps {
  index: number;
  item: any;
  answer: any | undefined;
  signedPhotos: Record<string, string>;
  coords: GeolocationCoordinates | null;
  disabled: boolean;
  onSave: (v: { answer_value: string | null; is_conformant: boolean | null; note: string | null; photos?: File[] }) => void;
  onRemovePhoto: (path: string) => void;
}

function ItemBlock({ index, item, answer, signedPhotos, disabled, onSave, onRemovePhoto }: ItemBlockProps) {
  const [note, setNote] = useState(answer?.note || "");
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [savedAt, setSavedAt] = useState<number>(0);

  useEffect(() => {
    setNote(answer?.note || "");
  }, [answer?.id]);

  const currentAnswer = answer?.answer_value as string | null | undefined;
  const currentConformant = answer?.is_conformant as boolean | null | undefined;
  const photos: string[] = answer?.photo_urls || [];

  const answer_missing_photo = item.photo_required && photos.length === 0 && pendingPhotos.length === 0;

  const setAnswer = (value: string | null, conformant: boolean | null) => {
    onSave({ answer_value: value, is_conformant: conformant, note, photos: pendingPhotos.length > 0 ? pendingPhotos : undefined });
    setPendingPhotos([]);
    setSavedAt(Date.now());
  };

  const saveNoteOnly = () => {
    if (currentAnswer === undefined || currentAnswer === null) return;
    onSave({ answer_value: currentAnswer, is_conformant: currentConformant ?? null, note, photos: pendingPhotos.length > 0 ? pendingPhotos : undefined });
    setPendingPhotos([]);
    setSavedAt(Date.now());
  };

  const answered = currentAnswer !== undefined && currentAnswer !== null;

  return (
    <div className={`border rounded-lg p-4 space-y-3 ${item.is_critical ? "border-red-200 bg-red-50/30" : "bg-card"}`}>
      <div className="flex items-start gap-2">
        <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5">#{index}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{item.question}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.is_critical && <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-200">Crítico</Badge>}
            {item.photo_required && <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 border-blue-200">Foto obrigatória</Badge>}
            {item.reference && <Badge variant="outline" className="text-[10px]">{item.reference}</Badge>}
          </div>
          {item.help_text && <p className="text-xs text-muted-foreground mt-1">{item.help_text}</p>}
        </div>
      </div>

      {/* Response widget */}
      <div>
        {(item.response_type === "yes_no" || item.response_type === "yes_no_na") && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="lg"
              type="button"
              disabled={disabled}
              variant={currentAnswer === "yes" ? "default" : "outline"}
              className={currentAnswer === "yes" ? "bg-green-600 hover:bg-green-700" : ""}
              onClick={() => setAnswer("yes", true)}
            >
              <Check className="h-4 w-4 mr-1" /> Sim
            </Button>
            <Button
              size="lg"
              type="button"
              disabled={disabled}
              variant={currentAnswer === "no" ? "default" : "outline"}
              className={currentAnswer === "no" ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => setAnswer("no", false)}
            >
              <X className="h-4 w-4 mr-1" /> Não
            </Button>
            {item.response_type === "yes_no_na" && (
              <Button
                size="lg"
                type="button"
                disabled={disabled}
                variant={currentAnswer === "na" ? "default" : "outline"}
                onClick={() => setAnswer("na", null)}
              >
                <MinusCircle className="h-4 w-4 mr-1" /> N/A
              </Button>
            )}
          </div>
        )}

        {item.response_type === "scale" && (
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                size="lg"
                type="button"
                disabled={disabled}
                variant={currentAnswer === String(n) ? "default" : "outline"}
                onClick={() => setAnswer(String(n), n >= 3)}
              >
                {n}
              </Button>
            ))}
          </div>
        )}

        {(item.response_type === "numeric" || item.response_type === "text") && (
          <div className="flex gap-2">
            <input
              type={item.response_type === "numeric" ? "number" : "text"}
              defaultValue={currentAnswer || ""}
              disabled={disabled}
              onBlur={(e) => e.target.value !== (currentAnswer || "") && setAnswer(e.target.value || null, true)}
              className="flex-1 h-10 rounded-md border bg-background px-3 text-sm"
              placeholder={item.expected_answer || (item.response_type === "numeric" ? "Digite o valor" : "Digite a resposta")}
            />
            {item.response_type !== "numeric" && (
              <Button
                variant="outline"
                type="button"
                disabled={disabled}
                onClick={() => setAnswer(currentAnswer || "", false)}
                className={currentConformant === false ? "border-red-500 text-red-700" : ""}
              >
                Marcar não conforme
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {photos.map((p) => (
            <div key={p} className="relative">
              <img src={signedPhotos[p]} alt="Evidência" className="h-16 w-16 object-cover rounded border" />
              {!disabled && (
                <button
                  onClick={() => onRemovePhoto(p)}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {pendingPhotos.map((f, i) => (
            <div key={i} className="h-16 w-16 rounded border bg-muted flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ))}
          {!disabled && (
            <label className={`h-16 w-16 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted ${answer_missing_photo ? "border-red-400 bg-red-50" : ""}`}>
              <Camera className="h-5 w-5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground mt-0.5">Foto</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  if (answered) {
                    onSave({
                      answer_value: currentAnswer!,
                      is_conformant: currentConformant ?? null,
                      note,
                      photos: files,
                    });
                  } else {
                    setPendingPhotos((prev) => [...prev, ...files]);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        {answer_missing_photo && <p className="text-[11px] text-red-600">Este item exige foto de evidência.</p>}
      </div>

      {/* Note */}
      <div>
        <Textarea
          placeholder="Observação (opcional)"
          value={note}
          disabled={disabled}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNoteOnly}
          rows={2}
          className="text-sm"
        />
      </div>

      {savedAt > 0 && Date.now() - savedAt < 2500 && (
        <p className="text-[11px] text-green-700 flex items-center gap-1"><Check className="h-3 w-3" /> Salvo</p>
      )}

      {answered && !item.is_critical && RESPONSE_TYPES[item.response_type] && (
        <p className="text-[10px] text-muted-foreground">{RESPONSE_TYPES[item.response_type]}</p>
      )}
    </div>
  );
}
