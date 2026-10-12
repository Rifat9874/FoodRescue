"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { CONDITIONS } from "@/lib/constants";
import CategoryBrowser from "@/components/CategoryBrowser";
import FoodCard from "@/components/FoodCard";
import Alert from "@/components/Alert";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { CardSkeletons } from "@/components/Loading";

const INITIAL_FILTERS = { q: "", category: "", condition: "", location: "", status: "", sort: "newest" };

function FoodBrowser() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS, category: searchParams.get("category") || "" });
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(INITIAL_FILTERS);

  useEffect(() => {
    api("/api/food/categories").then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // small delay so we do not call the API on every single keystroke
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
        const data = await api(`/api/food?${params}`);
        if (!cancelled) { setListings(data.listings); setError(""); }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [filters]);

  return (
    <main className="container page">
      <div className="page-header">
        <h1>Find available food</h1>
        <p>Browse surplus food shared by donors near you and request what your organization needs.</p>
      </div>

      {categories.length > 0 && (
        <CategoryBrowser categories={categories} selected={filters.category} onSelect={(category) => setFilters({ ...filters, category })} />
      )}

      <div className="filters" role="search">
        <div className="search-field">
          <Icon name="search" size={16} />
          <input aria-label="Search by food name" placeholder="Search food name" value={filters.q} onChange={set("q")} />
        </div>
        <select aria-label="Food type" value={filters.condition} onChange={set("condition")}>
          <option value="">All food types</option>
          {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="search-field">
          <Icon name="pin" size={16} />
          <input aria-label="Location" placeholder="Location" value={filters.location} onChange={set("location")} />
        </div>
        <select aria-label="Status" value={filters.status} onChange={set("status")}>
          <option value="">Available only</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
        </select>
        <select aria-label="Sort" value={filters.sort} onChange={set("sort")}>
          <option value="newest">Newest first</option>
          <option value="expiry">Expiring soonest</option>
        </select>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {loading && <CardSkeletons />}
      {!loading && !error && listings.length === 0 && (
        <EmptyState
          icon="search"
          title="No food matches your search"
          action={hasFilters && <button className="btn btn-outline" onClick={() => setFilters(INITIAL_FILTERS)}>Clear filters</button>}
        >
          Try fewer filters, or check back soon: new food is posted every day.
        </EmptyState>
      )}
      {!loading && <div className="grid">{listings.map((l) => <FoodCard key={l._id} listing={l} />)}</div>}
    </main>
  );
}

export default function FoodPage() {
  return (
    <Suspense fallback={<main className="container page"><CardSkeletons /></main>}>
      <FoodBrowser />
    </Suspense>
  );
}
