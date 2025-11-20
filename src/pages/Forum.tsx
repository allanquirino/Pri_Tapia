import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/services/database";
import { sessionService } from "@/services/session";

const Forum = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [catName, setCatName] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    const r = await db.forumCategories();
    setCategories(r);
  };
  const loadTopics = async (catId: string) => {
    const r = await db.forumTopics(catId);
    setTopics(r); setSelectedCat(catId); setPosts([]); setSelectedTopic("");
  };
  const loadPosts = async (topicId: string) => {
    const r = await db.forumPosts(topicId);
    setPosts(r); setSelectedTopic(topicId);
  };

  const createCategory = async () => {
    if (!sessionService.isAuthenticated()) { window.location.href = "/login"; return; }
    if (!catName.trim()) return;
    await db.forumCreateCategory({ name: catName });
    setCatName("");
    await loadCategories();
  };
  const createTopic = async () => {
    if (!sessionService.isAuthenticated()) { window.location.href = "/login"; return; }
    if (!topicTitle.trim() || !selectedCat) return;
    await db.forumCreateTopic({ categoryId: selectedCat, title: topicTitle });
    setTopicTitle("");
    await loadTopics(selectedCat);
  };
  const createPost = async () => {
    if (!sessionService.isAuthenticated()) { window.location.href = "/login"; return; }
    if (!postContent.trim() || !selectedTopic) return;
    await db.forumCreatePost({ topicId: selectedTopic, content: postContent });
    setPostContent("");
    await loadPosts(selectedTopic);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-soft py-8">
        <div className="container mx-auto px-4 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Fórum da Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">Categorias</div>
                    <div className="flex gap-2">
                      <Input placeholder="Nova categoria" value={catName} onChange={(e)=>setCatName(e.target.value)} />
                      <Button onClick={createCategory}>Criar</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {categories.map((c)=> (
                      <button key={c.id} className={`w-full text-left rounded-md border p-2 ${selectedCat===c.id?'border-primary':''}`} onClick={()=>loadTopics(c.id)}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">Tópicos</div>
                    <div className="flex gap-2">
                      <Input placeholder="Novo tópico" value={topicTitle} onChange={(e)=>setTopicTitle(e.target.value)} />
                      <Button onClick={createTopic}>Criar</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {topics.map((t)=> (
                      <button key={t.id} className={`w-full text-left rounded-md border p-2 ${selectedTopic===t.id?'border-primary':''}`} onClick={()=>loadPosts(t.id)}>
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">Posts</div>
                    <div className="flex gap-2">
                      <Input placeholder="Nova postagem" value={postContent} onChange={(e)=>setPostContent(e.target.value)} />
                      <Button onClick={createPost}>Publicar</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {posts.map((p)=> (
                      <div key={p.id} className="rounded-md border p-2">
                        <div className="text-sm">{p.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Forum;
