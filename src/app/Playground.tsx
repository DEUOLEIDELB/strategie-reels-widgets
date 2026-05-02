import { useState } from 'react';
import { Plus, Trash2, Search, Star } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Chip,
  ColorBadge,
  ConfirmDialog,
  Drawer,
  EmptyState,
  FormField,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
} from '@/shared/components';

export function Playground() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tab, setTab] = useState('atomes');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Design system</h1>
        <p className="text-sm text-text-faint">
          Référence visuelle vivante. Quand tu doutes d'un composant, ouvre cette page.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="atomes" count={12}>Atomes</TabsTrigger>
          <TabsTrigger value="molecules" count={6}>Molécules</TabsTrigger>
          <TabsTrigger value="patterns" count={4}>Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="atomes" className="space-y-6 mt-4">
          <Section title="Buttons">
            <Row>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </Row>
            <Row>
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium</Button>
              <Button size="lg" variant="primary">Large</Button>
            </Row>
          </Section>

          <Section title="IconButtons">
            <Row>
              <IconButton icon={Plus} label="Ajouter" />
              <IconButton icon={Plus} label="Ajouter" tone="primary" />
              <IconButton icon={Trash2} label="Supprimer" tone="danger" />
              <IconButton icon={Search} label="Chercher" tone="ghost" />
              <IconButton icon={Plus} label="Petit" size="sm" />
            </Row>
          </Section>

          <Section title="Inputs">
            <div className="grid grid-cols-2 gap-3 max-w-xl">
              <FormField label="Nom" required>
                <Input placeholder="Marie..." />
              </FormField>
              <FormField label="Avec erreur" error="Ce champ est requis">
                <Input placeholder="Vide" error="x" />
              </FormField>
              <FormField label="Désactivé">
                <Input placeholder="..." disabled />
              </FormField>
              <FormField label="Petit">
                <Input size="sm" placeholder="..." />
              </FormField>
            </div>
            <FormField label="Description" hint="Max 200 caractères.">
              <Textarea rows={3} placeholder="Décris..." />
            </FormField>
            <FormField label="Statut">
              <Select defaultValue="">
                <option value="">Choisir...</option>
                <option value="a">Idée</option>
                <option value="b">Prêt</option>
                <option value="c">Posté</option>
              </Select>
            </FormField>
          </Section>

          <Section title="Badges">
            <Row>
              <Badge>Default</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="current">Current</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge color="#5914D0">Custom</Badge>
              <Badge color="#5914D0" soft>Soft</Badge>
            </Row>
          </Section>

          <Section title="Chips">
            <Row>
              <Chip>Default</Chip>
              <Chip active>Actif</Chip>
              <Chip onClick={() => {}}>Cliquable</Chip>
              <Chip onRemove={() => {}}>Avec X</Chip>
            </Row>
          </Section>

          <Section title="ColorBadges">
            <Row>
              <ColorBadge colorHex="#5914D0" size="xs" />
              <ColorBadge colorHex="#1DC1F9" size="sm" />
              <ColorBadge colorHex="#1F8A4A" size="md" />
              <ColorBadge colorHex="#D40272" size="lg" />
            </Row>
          </Section>

          <Section title="Spinners + Skeletons">
            <Row>
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </Row>
            <div className="space-y-2 max-w-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="molecules" className="space-y-6 mt-4">
          <Section title="Cards">
            <div className="grid grid-cols-2 gap-3 max-w-xl">
              <Card>
                <CardHeader>
                  <CardTitle>Card simple</CardTitle>
                </CardHeader>
                <CardBody>Contenu de la card.</CardBody>
              </Card>
              <Card hoverable>
                <CardBody>
                  <div className="font-medium">Card cliquable</div>
                  <div className="text-xs text-text-faint">Hover state actif.</div>
                </CardBody>
              </Card>
              <Card selected>
                <CardBody>
                  <div className="font-medium">Card sélectionnée</div>
                </CardBody>
              </Card>
            </div>
          </Section>

          <Section title="Modal / Drawer / ConfirmDialog">
            <Row>
              <Button variant="primary" onClick={() => setModalOpen(true)}>Ouvrir Modal</Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Ouvrir Drawer</Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>Confirm danger</Button>
            </Row>
            <Modal open={modalOpen} onOpenChange={setModalOpen} title="Titre du modal" size="md">
              <ModalBody>
                <p className="text-sm text-text-dim leading-relaxed">
                  Contenu du modal. Ferme avec Escape, click outside ou bouton X.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>Valider</Button>
              </ModalFooter>
            </Modal>
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Détail Drawer">
              <div className="p-4 text-sm text-text-dim space-y-2">
                <p>Contenu du drawer.</p>
                <p>Slide depuis la droite.</p>
              </div>
            </Drawer>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Supprimer ce reel ?"
              description="Cette action est irréversible."
              tone="danger"
              confirmLabel="Supprimer"
              onConfirm={async () => {
                await new Promise((r) => setTimeout(r, 600));
              }}
            />
          </Section>

          <Section title="Tooltip">
            <Row>
              <Tooltip content="Tooltip top">
                <Button variant="secondary">Hover top</Button>
              </Tooltip>
              <Tooltip content="Tooltip right" placement="right">
                <Button variant="secondary">Hover right</Button>
              </Tooltip>
              <Tooltip content="Tooltip bottom" placement="bottom">
                <Button variant="secondary">Hover bottom</Button>
              </Tooltip>
            </Row>
          </Section>

          <Section title="EmptyState">
            <EmptyState
              icon={<Star size={28} />}
              title="Aucun reel pour cette combo"
              description="Crée ton premier reel ou injecte un hook depuis la Bibliothèque."
              action={<Button variant="primary">+ Nouveau reel</Button>}
            />
          </Section>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6 mt-4">
          <Section title="Master-detail-detail (3 colonnes)">
            <div className="h-64 border border-border rounded-md bg-surface flex">
              <div className="w-48 border-r border-border bg-surface-two p-3 text-xs text-text-faint">
                Colonne nav 280px
              </div>
              <div className="flex-1 p-3 text-xs text-text-faint">Centre flex</div>
              <div className="w-56 border-l border-border bg-surface-two p-3 text-xs text-text-faint">
                Panneau 380px
              </div>
            </div>
          </Section>

          <Section title="Form layout">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Créer un avatar</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-3">
                  <FormField label="Prénom" required>
                    <Input placeholder="Marie" />
                  </FormField>
                  <FormField label="Profession">
                    <Input placeholder="Maman au foyer" />
                  </FormField>
                  <FormField label="Description">
                    <Textarea placeholder="..." />
                  </FormField>
                </div>
              </CardBody>
            </Card>
          </Section>

          <Section title="Grid de cards">
            <div className="grid grid-cols-3 gap-3 max-w-2xl">
              {[1, 2, 3].map((i) => (
                <Card key={i} hoverable>
                  <CardBody>
                    <div className="font-medium text-sm">Item {i}</div>
                    <div className="text-xs text-text-faint mt-1">Description courte sur 2 lignes max ici lorem ipsum.</div>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="accent">A</Badge>
                      <Badge variant="info">B</Badge>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Loading state">
            <div className="grid grid-cols-3 gap-3 max-w-2xl">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardBody className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </CardBody>
                </Card>
              ))}
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
