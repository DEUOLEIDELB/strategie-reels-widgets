import type { PostConcurrent } from '@/shared/lib/types';

// Calcule le score de viralité d'un post : vues / médiane des autres posts du même concurrent.
// Si le concurrent a moins de 3 posts pour calculer une médiane fiable, on tombe sur la médiane
// globale du feed. Si vues = 0, on retourne 0.
export function computeViralScore(
  post: PostConcurrent,
  allPosts: PostConcurrent[],
): number {
  if (!post.vues || post.vues <= 0) return 0;

  const sameConc = allPosts.filter(
    (p) => p.concurrent === post.concurrent && p.id !== post.id && p.vues > 0,
  );

  let baseline: number;
  if (sameConc.length >= 3) {
    baseline = median(sameConc.map((p) => p.vues));
  } else {
    const others = allPosts.filter((p) => p.id !== post.id && p.vues > 0);
    if (!others.length) return 1;
    baseline = median(others.map((p) => p.vues));
  }

  if (baseline <= 0) return 1;
  return post.vues / baseline;
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Retourne tous les posts avec score recalculé en mémoire.
// Utile pour l'affichage dynamique sans toucher Grist.
export function withComputedScores(posts: PostConcurrent[]): PostConcurrent[] {
  return posts.map((p) => ({
    ...p,
    score_viralite: computeViralScore(p, posts),
  }));
}
