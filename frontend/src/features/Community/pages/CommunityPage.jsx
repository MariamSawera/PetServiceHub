import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, PawPrint, Send, ShieldQuestion, Trash2 } from 'lucide-react';
import { useAuth } from '../../Auth/context/useAuth';
import { createComment, createPost, deleteComment, deletePost, getPostComments, getPosts } from '../services/communityApi';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'health', label: 'Health' },
  { value: 'behavior', label: 'Behavior' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'grooming', label: 'Grooming' },
  { value: 'advice', label: 'Advice' },
];

const categoryLabels = Object.fromEntries(CATEGORIES.map((category) => [category.value, category.label]));

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [drafts, setDrafts] = useState({});
  const [postForm, setPostForm] = useState({ title: '', content: '', category: 'general' });
  const [state, setState] = useState('loading');
  const [savingPost, setSavingPost] = useState(false);
  const [error, setError] = useState('');
  const [interactionPrompt, setInteractionPrompt] = useState('');

  useEffect(() => {
    getPosts()
      .then(({ data }) => { setPosts(data); setState('ready'); })
      .catch(() => setState('error'));
  }, []);

  const requireUser = (action) => {
    if (user) return true;
    setInteractionPrompt(action);
    return false;
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();
    if (!requireUser('ask')) return;
    setSavingPost(true);
    setError('');
    try {
      const { data } = await createPost(postForm);
      setPosts((current) => [data, ...current]);
      setPostForm({ title: '', content: '', category: 'general' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not publish your question.');
    } finally {
      setSavingPost(false);
    }
  };

  const toggleComments = async (postId) => {
    if (comments[postId]) {
      setComments((current) => ({ ...current, [postId]: null }));
      return;
    }
    try {
      const { data } = await getPostComments(postId);
      setComments((current) => ({ ...current, [postId]: data }));
    } catch {
      setError('Could not load replies. Please try again.');
    }
  };

  const handleCommentSubmit = async (event, postId) => {
    event.preventDefault();
    if (!requireUser('reply')) return;
    const content = drafts[postId]?.trim();
    if (!content) return;
    try {
      const { data } = await createComment(postId, content);
      setComments((current) => ({ ...current, [postId]: [...(current[postId] || []), data] }));
      setDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not post your reply.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this question and its replies?')) return;
    try {
      await deletePost(postId);
      setPosts((current) => current.filter((post) => post._id !== postId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this question.');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(commentId);
      setComments((current) => ({ ...current, [postId]: current[postId].filter((comment) => comment._id !== commentId) }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this reply.');
    }
  };

  return (
    <main className="min-h-[70vh] bg-[var(--theme-bg)]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-12 md:py-20">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-700"><PawPrint size={17} /> PawCare community</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">Real questions. Kind answers. Happier pets.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Learn from other pet parents, share what has worked for your companion, and find a little support along the way.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1400px] gap-8 px-6 py-10 md:px-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-14">
        <div>
          {!user && <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-900">Want to join the conversation?</p><p className="mt-1 text-sm text-slate-600">Sign up to ask questions and respond to other pet parents.</p></div><Link to="/signup" className="inline-flex w-fit shrink-0 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Create account</Link></div>}
          {interactionPrompt && !user && <div role="alert" className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><span>You need an account to {interactionPrompt === 'ask' ? 'ask a question' : 'respond to a post'}.</span><Link to="/signup" className="shrink-0 font-bold underline">Sign up</Link></div>}
          {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          {state === 'loading' && <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading community posts...</p>}
          {state === 'error' && <p className="rounded-2xl border border-red-100 bg-red-50 p-10 text-center text-sm font-semibold text-red-700">Could not load the community right now.</p>}
          {state === 'ready' && posts.length === 0 && <p className="rounded-2xl border border-dashed border-teal-200 bg-white p-10 text-center text-sm text-slate-500">No questions yet. Be the first to start the conversation.</p>}
          {state === 'ready' && <div className="space-y-5">{posts.map((post) => <PostCard key={post._id} post={post} user={user} comments={comments[post._id]} draft={drafts[post._id] || ''} onToggleComments={() => toggleComments(post._id)} onCommentChange={(value) => setDrafts((current) => ({ ...current, [post._id]: value }))} onCommentSubmit={(event) => handleCommentSubmit(event, post._id)} onDeletePost={() => handleDeletePost(post._id)} onDeleteComment={(commentId) => handleDeleteComment(post._id, commentId)} onInteraction={(action) => requireUser(action)} />)}</div>}
        </div>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><ShieldQuestion size={23} /></div><h2 className="mt-5 text-xl font-bold text-slate-950">Ask with care</h2><p className="mt-3 text-sm leading-6 text-slate-600">Community advice can be helpful, but it cannot replace a veterinarian. For urgent symptoms, contact a clinic directly.</p><Link to="/find-vets" className="mt-5 inline-flex items-center text-sm font-bold text-teal-700 hover:underline">Find a vet <span className="ml-1">&rarr;</span></Link></aside>
      </section>
      {user && <section className="mx-auto max-w-[1400px] px-6 pb-14 md:px-12"><form onSubmit={handlePostSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Start a discussion</p><h2 className="mt-2 text-2xl font-black text-slate-950">What would you like to ask?</h2><div className="mt-6 grid gap-4"><input required value={postForm.title} onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))} maxLength="160" placeholder="Question title" className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /><div className="grid gap-4 sm:grid-cols-[1fr_180px]"><textarea required value={postForm.content} onChange={(event) => setPostForm((current) => ({ ...current, content: event.target.value }))} maxLength="5000" rows="4" placeholder="Tell the community about your pet..." className="resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /><select value={postForm.category} onChange={(event) => setPostForm((current) => ({ ...current, category: event.target.value }))} className="h-fit rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500">{CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></div></div><button disabled={savingPost} type="submit" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"><Send size={17} /> {savingPost ? 'Publishing...' : 'Publish question'}</button></form></section>}
    </main>
  );
}

function PostCard({ post, user, comments, draft, onToggleComments, onCommentChange, onCommentSubmit, onDeletePost, onDeleteComment, onInteraction }) {
  const isPostAuthor = user && post.author?._id === user._id;
  return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">{categoryLabels[post.category]}</span><span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span></div><h2 className="mt-4 text-2xl font-bold text-slate-950">{post.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{post.content}</p></div>{isPostAuthor && <button type="button" onClick={onDeletePost} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete question"><Trash2 size={17} /></button>}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-500">Asked by {post.author?.name || 'Pet parent'}</span><button type="button" onClick={onToggleComments} className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900"><MessageCircle size={17} /> {comments ? `${comments.length} ${comments.length === 1 ? 'reply' : 'replies'}` : 'View replies'}</button></div>{comments && <div className="mt-5 border-t border-slate-100 pt-5"><div className="space-y-4">{comments.length === 0 ? <p className="text-sm text-slate-500">No replies yet. Be the first to respond.</p> : comments.map((comment) => <div key={comment._id} className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-700">{comment.author?.name || 'Pet parent'} <span className="ml-2 font-normal text-slate-400">{formatDate(comment.createdAt)}</span></p><p className="mt-1 text-sm leading-6 text-slate-600">{comment.content}</p></div>{user && (comment.author?._id === user._id || isPostAuthor) && <button type="button" onClick={() => onDeleteComment(comment._id)} className="shrink-0 p-1 text-slate-400 hover:text-red-600" aria-label="Delete reply"><Trash2 size={14} /></button>}</div>)}</div><form onSubmit={onCommentSubmit} className="mt-5 flex gap-2"><input value={draft} onChange={(event) => onCommentChange(event.target.value)} onFocus={() => { if (!user) onInteraction('reply'); }} placeholder={user ? 'Share a helpful reply...' : 'Sign up to reply'} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500" /><button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-700" aria-label="Send reply"><Send size={15} /></button></form></div>}</article>;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
