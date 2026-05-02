import type { Hook, Script, Reel } from '@/shared/lib/types';
import { firstSpokenSentence } from './parsing';

// Tout ce qui peut être injecté en V1.
// Les Ressources ne créent pas de Reel : on les copie en presse-papier (cf. Drawer).

export interface ComboCtx {
  avatar: number;
  angle: number;
  probleme: number;
}

type ReelInput = Partial<Omit<Reel, 'id'>>;

export function hookToReelInput(hook: Hook, ctx: ComboCtx): ReelInput {
  return {
    avatar: ctx.avatar,
    angle: ctx.angle,
    probleme: ctx.probleme,
    titre: `Hook ${hook.id}`,
    hook_verbal: hook.texte ?? '',
    titre_overlay: hook.thumbnail ?? '',
    cta_texte: hook.cta_associe ?? '',
    signal_algo: hook.signal_algo_cible ?? '',
    serie: hook.serie ?? '',
    statut: 'concept',
  };
}

export function scriptToReelInput(script: Script, ctx: ComboCtx): ReelInput {
  return {
    avatar: ctx.avatar,
    angle: ctx.angle,
    probleme: ctx.probleme,
    titre: script.titre ?? `Script ${script.id}`,
    hook_verbal: firstSpokenSentence(script.texte_oral_complet),
    titre_overlay: script.texte_overlay ?? '',
    structure_body: script.structure_body ?? '',
    cta_type: script.cta_type ?? '',
    cta_texte: script.cta_texte ?? '',
    signal_algo: script.signal_algo_cible ?? '',
    duree_sec: script.duree_sec ?? 0,
    statut: 'scripté',
  };
}
