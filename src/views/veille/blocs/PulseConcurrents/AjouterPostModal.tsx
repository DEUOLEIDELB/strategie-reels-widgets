import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  FormField,
  Input,
  Select,
} from '@/shared/components';
import {
  useCreatePostConcurrent,
  useConcurrents,
} from '@/shared/hooks/grist';
import {
  POST_PLATEFORMES,
  POST_FORMATS,
  POST_FORMAT_LABELS,
  type PostFormat,
  type PostPlateforme,
} from '@/shared/lib/types';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultConcurrent?: number;
}

function detectPlateforme(url: string): PostPlateforme | '' {
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/(youtube\.com|youtu\.be)/i.test(url)) return 'youtube';
  return '';
}

export function AjouterPostModal({ open, onOpenChange, defaultConcurrent }: Props) {
  const create = useCreatePostConcurrent();
  const concurrentsQ = useConcurrents();

  const [url, setUrl] = useState('');
  const [concurrent, setConcurrent] = useState<number | ''>('');
  const [plateforme, setPlateforme] = useState<PostPlateforme | ''>('');
  const [thumbnail, setThumbnail] = useState('');
  const [datePost, setDatePost] = useState('');
  const [vues, setVues] = useState<number | ''>('');
  const [likes, setLikes] = useState<number | ''>('');
  const [comments, setComments] = useState<number | ''>('');
  const [format, setFormat] = useState<PostFormat | ''>('');

  useEffect(() => {
    if (open) {
      setUrl('');
      setConcurrent(defaultConcurrent ?? '');
      setPlateforme('');
      setThumbnail('');
      setDatePost(new Date().toISOString().slice(0, 10));
      setVues('');
      setLikes('');
      setComments('');
      setFormat('');
    }
  }, [open, defaultConcurrent]);

  // Auto-detect platform from URL
  useEffect(() => {
    const p = detectPlateforme(url);
    if (p) setPlateforme(p);
  }, [url]);

  const canSubmit = !!url.trim() && !!concurrent && !!plateforme;

  function handleSubmit() {
    if (!canSubmit) return;
    create.mutate(
      {
        url_post: url.trim(),
        concurrent: concurrent as number,
        plateforme: plateforme as PostPlateforme,
        thumbnail_url: thumbnail.trim(),
        date_post: datePost || null,
        vues: typeof vues === 'number' ? vues : 0,
        likes: typeof likes === 'number' ? likes : 0,
        comments: typeof comments === 'number' ? comments : 0,
        format_detecte: (format || '') as PostFormat,
        score_viralite: 0,
        caption: '',
        notes: '',
      },
      {
        onSuccess: () => {
          toast.success('Post ajouté au feed');
          onOpenChange(false);
        },
        onError: (e) => toast.error(`Échec : ${(e as Error).message}`),
      },
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Ajouter un post concurrent" size="md">
      <ModalBody>
        <div className="flex flex-col gap-3">
          <FormField label="URL du post" required hint="Instagram / TikTok / YouTube">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Concurrent" required>
              <Select
                value={concurrent === '' ? '' : String(concurrent)}
                onChange={(e) => setConcurrent(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">— Choisir —</option>
                {(concurrentsQ.data || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Plateforme" required>
              <Select
                value={plateforme}
                onChange={(e) => setPlateforme(e.target.value as PostPlateforme | '')}
              >
                <option value="">— Auto —</option>
                {POST_PLATEFORMES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Thumbnail URL" hint="Facultatif. Clic droit sur la vidéo → Copier image">
            <Input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
            />
          </FormField>

          <div className="grid grid-cols-4 gap-2">
            <FormField label="Date">
              <Input type="date" value={datePost} onChange={(e) => setDatePost(e.target.value)} />
            </FormField>
            <FormField label="Vues">
              <Input
                type="number"
                value={vues}
                onChange={(e) =>
                  setVues(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0"
              />
            </FormField>
            <FormField label="Likes">
              <Input
                type="number"
                value={likes}
                onChange={(e) =>
                  setLikes(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0"
              />
            </FormField>
            <FormField label="Comments">
              <Input
                type="number"
                value={comments}
                onChange={(e) =>
                  setComments(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0"
              />
            </FormField>
          </div>

          <FormField label="Format" hint="Optionnel — peut être tagué plus tard">
            <Select value={format} onChange={(e) => setFormat(e.target.value as PostFormat | '')}>
              <option value="">— Non classé —</option>
              {POST_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {POST_FORMAT_LABELS[f]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={create.isPending}
        >
          Ajouter
        </Button>
      </ModalFooter>
    </Modal>
  );
}
