import { useState, useRef, useCallback } from 'react'
import './App.css'

// ─── FDA-style Nutrition Facts Label ──────────────────────────────────────────
function NutritionFactsLabel({ food, nutrients }) {
  const n = nutrients
  const get = id => Math.round((n[id] ?? 0) * 10) / 10

  return (
    <div className="nf-label">
      <div className="nf-title">Nutrition Facts</div>
      <div className="nf-serving">About 1 serving per container</div>
      <div className="nf-servings"><strong>Serving size</strong> 100g</div>
      <div className="nf-divider-thick" />
      <div style={{ fontSize: 11 }}>Amount Per Serving</div>
      <div className="nf-calories-row">
        <div className="nf-cal-label">Calories</div>
        <div className="nf-cal-num">{Math.round(n[1008] ?? 0)}</div>
      </div>
      <div className="nf-divider-thick" />
      <div className="nf-dv-note">% Daily Value*</div>

      <div className="nf-row">
        <span><span className="bold">Total Fat</span> {get(1004)}g</span>
        <span className="bold">{Math.round(((n[1004]??0)/78)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span className="indent">Saturated Fat 0g</span>
        <span>0%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span className="indent"><em>Trans</em> Fat 0g</span>
        <span></span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span><span className="bold">Cholesterol</span> 0mg</span>
        <span className="bold">0%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span><span className="bold">Sodium</span> {get(1093)}mg</span>
        <span className="bold">{Math.round(((n[1093]??0)/2300)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span><span className="bold">Total Carbohydrate</span> {get(1005)}g</span>
        <span className="bold">{Math.round(((n[1005]??0)/275)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span className="indent">Dietary Fiber {get(1079)}g</span>
        <span>{Math.round(((n[1079]??0)/28)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span className="indent">Total Sugars {get(2000)}g</span>
        <span></span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span className="indent2">Includes {get(2000)}g Added Sugars</span>
        <span>{Math.round(((n[2000]??0)/50)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span><span className="bold">Protein</span> {get(1003)}g</span>
        <span className="bold">{Math.round(((n[1003]??0)/50)*100)}%</span>
      </div>

      <div className="nf-divider-mid" />
      <div className="nf-row">
        <span>Vitamin D {get(1114)}IU</span>
        <span>{Math.round(((n[1114]??0)/800)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span>Calcium {get(1087)}mg</span>
        <span>{Math.round(((n[1087]??0)/1300)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span>Iron {get(1089)}mg</span>
        <span>{Math.round(((n[1089]??0)/18)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span>Potassium {get(1092)}mg</span>
        <span>{Math.round(((n[1092]??0)/4700)*100)}%</span>
      </div>
      <div className="nf-divider-thin" />
      <div className="nf-row">
        <span>Vitamin C {get(1162)}mg</span>
        <span>{Math.round(((n[1162]??0)/90)*100)}%</span>
      </div>

      <div className="nf-footer">
        * The % Daily Value (DV) tells you how much a nutrient in a serving of food
        contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
        <br /><br />
        <strong>{food.description}</strong><br />
        Data: USDA FoodData Central
      </div>
    </div>
  )
}

// ─── USDA FoodData Central API (free, DEMO_KEY = 30 req/hr) ───────────────────
const USDA_KEY = 'DEMO_KEY' // Get your free key at: https://fdc.nal.usda.gov/api-key-signup

async function searchFoods(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=8&api_key=${USDA_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.foods || []
}

async function getFoodDetail(fdcId) {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Detail failed')
  return await res.json()
}

// ─── Nutrient ID → label/unit/DV map ──────────────────────────────────────────
const NUTRIENT_MAP = {
  1008: { label: 'Calories',     unit: 'kcal', dv: 2000,  group: 'macro'   },
  1003: { label: 'Protein',      unit: 'g',    dv: 50,    group: 'macro'   },
  1005: { label: 'Carbs',        unit: 'g',    dv: 275,   group: 'macro'   },
  1004: { label: 'Total Fat',    unit: 'g',    dv: 78,    group: 'macro'   },
  1079: { label: 'Fiber',        unit: 'g',    dv: 28,    group: 'macro'   },
  2000: { label: 'Sugars',       unit: 'g',    dv: 50,    group: 'macro'   },
  1093: { label: 'Sodium',       unit: 'mg',   dv: 2300,  group: 'mineral' },
  1087: { label: 'Calcium',      unit: 'mg',   dv: 1300,  group: 'mineral' },
  1089: { label: 'Iron',         unit: 'mg',   dv: 18,    group: 'mineral' },
  1090: { label: 'Magnesium',    unit: 'mg',   dv: 420,   group: 'mineral' },
  1091: { label: 'Phosphorus',   unit: 'mg',   dv: 1250,  group: 'mineral' },
  1092: { label: 'Potassium',    unit: 'mg',   dv: 4700,  group: 'mineral' },
  1095: { label: 'Zinc',         unit: 'mg',   dv: 11,    group: 'mineral' },
  1162: { label: 'Vitamin C',    unit: 'mg',   dv: 90,    group: 'vitamin' },
  1165: { label: 'Vitamin B1',   unit: 'mg',   dv: 1.2,   group: 'vitamin' },
  1166: { label: 'Vitamin B2',   unit: 'mg',   dv: 1.3,   group: 'vitamin' },
  1167: { label: 'Niacin (B3)',  unit: 'mg',   dv: 16,    group: 'vitamin' },
  1175: { label: 'Vitamin B6',   unit: 'mg',   dv: 1.7,   group: 'vitamin' },
  1177: { label: 'Folate (B9)',  unit: 'µg',   dv: 400,   group: 'vitamin' },
  1178: { label: 'Vitamin B12',  unit: 'µg',   dv: 2.4,   group: 'vitamin' },
  1114: { label: 'Vitamin D',    unit: 'IU',   dv: 800,   group: 'vitamin' },
  1109: { label: 'Vitamin E',    unit: 'mg',   dv: 15,    group: 'vitamin' },
  1185: { label: 'Vitamin K',    unit: 'µg',   dv: 120,   group: 'vitamin' },
  1106: { label: 'Vitamin A',    unit: 'IU',   dv: 5000,  group: 'vitamin' },
}

function extractNutrients(foodNutrients = []) {
  const out = {}
  for (const fn of foodNutrients) {
    const id = fn.nutrient?.id ?? fn.nutrientId
    if (NUTRIENT_MAP[id]) {
      out[id] = fn.amount ?? fn.value ?? 0
    }
  }
  return out
}

// ─── Health tags ──────────────────────────────────────────────────────────────
const TAG_DEFS = [
  { key: 'high-protein',  label: '💪 High Protein',   color: '#3b82f6', check: n => (n[1003] ?? 0) >= 15 },
  { key: 'low-carb',      label: '⚡ Low Carb',        color: '#8b5cf6', check: n => (n[1005] ?? 999) < 15 },
  { key: 'low-fat',       label: '🌿 Low Fat',         color: '#10b981', check: n => (n[1004] ?? 999) < 5  },
  { key: 'high-fiber',    label: '🌾 High Fiber',      color: '#f59e0b', check: n => (n[1079] ?? 0) >= 5  },
  { key: 'low-calorie',   label: '🔥 Low Calorie',     color: '#ef4444', check: n => (n[1008] ?? 999) < 100 },
  { key: 'keto-friendly', label: '🥑 Keto-Friendly',   color: '#f97316', check: n => (n[1005] ?? 999) < 5 && (n[1004] ?? 0) > 5 },
  { key: 'vit-c-rich',    label: '🍊 Rich in Vitamin C', color: '#f97316', check: n => (n[1162] ?? 0) >= 15 },
  { key: 'iron-rich',     label: '🩸 Good Iron Source', color: '#dc2626', check: n => (n[1089] ?? 0) >= 2 },
  { key: 'calcium-rich',  label: '🦴 Calcium Rich',    color: '#6366f1', check: n => (n[1087] ?? 0) >= 130 },
]

function getHealthTags(nutrients) {
  return TAG_DEFS.filter(t => t.check(nutrients))
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MacroRing({ value, max, color, label, unit }) {
  const pct = Math.min((value / max) * 100, 100)
  const r = 30, circ = 2 * Math.PI * r
  const stroke = (pct / 100) * circ
  return (
    <div className="macro-ring">
      <svg viewBox="0 0 80 80" className="ring-svg">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${stroke} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 40 40)" />
      </svg>
      <div className="ring-inner">
        <span className="ring-val">{value % 1 === 0 ? value : value.toFixed(1)}</span>
        <span className="ring-unit">{unit}</span>
      </div>
      <div className="ring-label">{label}</div>
    </div>
  )
}

function NutrientRow({ label, value, unit, dv }) {
  const pct = dv ? Math.min(Math.round((value / dv) * 100), 999) : null
  return (
    <div className="nutrient-row">
      <span className="nr-label">{label}</span>
      <span className="nr-value">{value % 1 === 0 ? value : value.toFixed(1)}{unit}</span>
      {pct !== null && <span className="nr-dv">{pct}% DV</span>}
      {pct !== null && (
        <div className="nr-bar">
          <div className="nr-fill" style={{ width: `${Math.min(pct, 100)}%`,
            background: pct >= 20 ? '#22c55e' : '#94a3b8' }} />
        </div>
      )}
    </div>
  )
}

function SearchResult({ food, onSelect }) {
  const kcal = food.foodNutrients?.find(n => n.nutrientId === 1008)?.value
  return (
    <button className="search-result" onClick={() => onSelect(food.fdcId)}>
      <div className="sr-name">{food.description}</div>
      <div className="sr-meta">
        {food.brandOwner && <span className="sr-brand">{food.brandOwner}</span>}
        {kcal != null && <span className="sr-kcal">{Math.round(kcal)} kcal</span>}
      </div>
    </button>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('search')   // 'search' | 'recipe' | 'photo'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [detail, setDetail] = useState(null)
  const [nutrients, setNutrients] = useState({})
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recipeText, setRecipeText] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showVitamins, setShowVitamins] = useState(false)
  const [showMinerals, setShowMinerals] = useState(false)
  const [showLabel, setShowLabel] = useState(false)
  const fileRef = useRef()

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(''); setDetail(null); setResults([])
    try {
      const foods = await searchFoods(query)
      setResults(foods)
      if (foods.length === 0) setError('No foods found. Try a different name.')
    } catch {
      setError('Search failed. Check your connection and try again.')
    } finally { setLoading(false) }
  }

  async function handleSelectFood(fdcId) {
    setLoading(true); setError(''); setResults([])
    try {
      const food = await getFoodDetail(fdcId)
      const n = extractNutrients(food.foodNutrients)
      setDetail(food)
      setNutrients(n)
      setTags(getHealthTags(n))
    } catch {
      setError('Could not load nutrition details.')
    } finally { setLoading(false) }
  }

  async function handleRecipeSearch(e) {
    e.preventDefault()
    if (!recipeText.trim()) return
    // For a recipe title or ingredient list, search the main item
    const mainQuery = recipeText.split('\n')[0].split(',')[0].trim()
    setQuery(mainQuery)
    setMode('search')
    setLoading(true); setError(''); setDetail(null); setResults([])
    try {
      const foods = await searchFoods(mainQuery)
      setResults(foods)
      if (foods.length === 0) setError('No matching foods found for your recipe.')
    } catch {
      setError('Search failed. Check your connection.')
    } finally { setLoading(false) }
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  function resetAll() {
    setDetail(null); setNutrients({}); setTags([])
    setResults([]); setError(''); setQuery('')
    setPhotoPreview(null); setRecipeText('')
  }

  const macros = [
    { id: 1008, label: 'Calories', unit: 'kcal', max: 2000, color: '#f97316' },
    { id: 1003, label: 'Protein',  unit: 'g',    max: 50,   color: '#3b82f6' },
    { id: 1005, label: 'Carbs',    unit: 'g',    max: 275,  color: '#f59e0b' },
    { id: 1004, label: 'Fat',      unit: 'g',    max: 78,   color: '#ec4899' },
  ]

  const vitamins = Object.entries(NUTRIENT_MAP)
    .filter(([, v]) => v.group === 'vitamin' && nutrients[Number(Object.keys(NUTRIENT_MAP).find(k => NUTRIENT_MAP[k] === v))] != null)
    .map(([id, v]) => ({ id: Number(id), ...v, value: nutrients[Number(id)] ?? 0 }))

  const vitaminsAll = Object.entries(NUTRIENT_MAP)
    .filter(([, v]) => v.group === 'vitamin')
    .map(([id, v]) => ({ id: Number(id), ...v, value: nutrients[Number(id)] ?? 0 }))

  const mineralsAll = Object.entries(NUTRIENT_MAP)
    .filter(([, v]) => v.group === 'mineral')
    .map(([id, v]) => ({ id: Number(id), ...v, value: nutrients[Number(id)] ?? 0 }))

  return (
    <div className="app">
      {/* ── Hero header ── */}
      <header className="hero">
        <div className="hero-inner">
          <h1 className="brand">🥦 NutriScan</h1>
          <p className="hero-sub">Instant nutrition facts for any food, recipe, or ingredient.</p>
        </div>
      </header>

      {/* ── Mode tabs ── */}
      <div className="mode-tabs">
        {[
          { id: 'search', icon: '🔍', label: 'Search Food' },
          { id: 'recipe', icon: '📜', label: 'Recipe' },
          { id: 'photo',  icon: '📷', label: 'Photo Scan' },
        ].map(m => (
          <button key={m.id}
            className={`mode-tab ${mode === m.id ? 'active' : ''}`}
            onClick={() => { setMode(m.id); resetAll() }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <main className="main">
        <div className="content-wrap">

          {/* ══ SEARCH MODE ══ */}
          {mode === 'search' && !detail && (
            <div className="input-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-row">
                  <input className="search-input"
                    type="text" placeholder="e.g. chicken breast, avocado, Big Mac…"
                    value={query} onChange={e => setQuery(e.target.value)} autoFocus />
                  <button type="submit" className="search-btn" disabled={loading}>
                    {loading ? '…' : '🔍 Search'}
                  </button>
                </div>
              </form>
              {error && <p className="error-msg">⚠️ {error}</p>}
              {results.length > 0 && (
                <div className="results-list">
                  <p className="results-hint">Select a food to see full nutrition facts</p>
                  {results.map(f => (
                    <SearchResult key={f.fdcId} food={f}
                      onSelect={loading ? () => {} : handleSelectFood} />
                  ))}
                </div>
              )}
              {!loading && results.length === 0 && !error && (
                <div className="search-hero-hint">
                  <div className="hint-grid">
                    {['🍎 Apple','🍗 Chicken','🥑 Avocado','🥦 Broccoli','🐟 Salmon','🍌 Banana'].map(f => (
                      <button key={f} className="hint-chip"
                        onClick={() => { setQuery(f.split(' ')[1]); }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ RECIPE MODE ══ */}
          {mode === 'recipe' && !detail && (
            <div className="input-section">
              <form onSubmit={handleRecipeSearch} className="recipe-form">
                <label className="form-label">Enter a recipe title or paste ingredients:</label>
                <textarea className="recipe-input"
                  placeholder={"Examples:\n\nPasta Carbonara\n\nor paste ingredients:\nchicken breast, garlic, olive oil, lemon"}
                  rows={6} value={recipeText}
                  onChange={e => setRecipeText(e.target.value)} />
                <button type="submit" className="search-btn full-width" disabled={loading}>
                  {loading ? 'Searching…' : '🔍 Analyze Recipe'}
                </button>
              </form>
              {error && <p className="error-msg">⚠️ {error}</p>}
              {results.length > 0 && (
                <div className="results-list">
                  <p className="results-hint">Select the closest match for your recipe</p>
                  {results.map(f => (
                    <SearchResult key={f.fdcId} food={f} onSelect={handleSelectFood} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ PHOTO MODE ══ */}
          {mode === 'photo' && !detail && (
            <div className="input-section">
              <div className="photo-zone" onClick={() => fileRef.current?.click()}>
                {photoPreview
                  ? <img src={photoPreview} alt="preview" className="photo-preview" />
                  : <>
                      <span className="photo-icon">📷</span>
                      <p className="photo-label">Click to upload a food photo</p>
                      <p className="photo-sub">JPG, PNG, WEBP supported</p>
                    </>
                }
                <input ref={fileRef} type="file" accept="image/*" className="file-input"
                  onChange={handlePhotoChange} />
              </div>
              {photoPreview && (
                <div className="photo-actions">
                  <p className="photo-notice">
                    🔬 <strong>AI image recognition</strong> requires a vision API key
                    (e.g. Google Cloud Vision). For now, type the food name below:
                  </p>
                  <form onSubmit={handleSearch} className="search-form" style={{ marginTop: '1rem' }}>
                    <div className="search-row">
                      <input className="search-input" type="text"
                        placeholder="What food is in the photo?"
                        value={query} onChange={e => setQuery(e.target.value)} />
                      <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? '…' : '🔍 Search'}
                      </button>
                    </div>
                  </form>
                  {results.length > 0 && (
                    <div className="results-list">
                      {results.map(f => (
                        <SearchResult key={f.fdcId} food={f} onSelect={handleSelectFood} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ NUTRITION DETAIL ══ */}
          {detail && (
            <div className="detail-section">
              <button className="back-btn" onClick={resetAll}>← Back to search</button>

              {/* Food name */}
              <div className="food-header">
                <h2 className="food-title">{detail.description}</h2>
                {detail.brandOwner && <p className="food-brand">{detail.brandOwner}</p>}
                <p className="food-serving">
                  Per 100g serving
                  {detail.servingSize && ` · ${detail.servingSize}${detail.servingSizeUnit} serving`}
                </p>
              </div>

              {/* Health tags */}
              {tags.length > 0 && (
                <div className="tags-row">
                  {tags.map(t => (
                    <span key={t.key} className="health-tag" style={{ background: t.color }}>
                      {t.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Calorie spotlight */}
              <div className="calorie-spotlight">
                <span className="cal-number">{Math.round(nutrients[1008] ?? 0)}</span>
                <span className="cal-label">Calories per 100g</span>
              </div>

              {/* Macro rings */}
              <div className="macros-grid">
                {macros.slice(1).map(m => (
                  <MacroRing key={m.id}
                    value={Math.round((nutrients[m.id] ?? 0) * 10) / 10}
                    max={m.max} color={m.color} label={m.label} unit={m.unit} />
                ))}
              </div>

              {/* Extra macros: fiber, sugar, sodium */}
              <div className="extra-macros">
                {[
                  { id: 1079, label: '🌾 Fiber',   color: '#22c55e' },
                  { id: 2000, label: '🍬 Sugars',  color: '#f43f5e' },
                  { id: 1093, label: '🧂 Sodium',  color: '#94a3b8', unit: 'mg' },
                ].map(item => {
                  const { label: mapLabel, unit, dv } = NUTRIENT_MAP[item.id]
                  const val = nutrients[item.id] ?? 0
                  const pct = Math.min((val / dv) * 100, 100)
                  return (
                    <div key={item.id} className="extra-macro-row">
                      <span className="em-label">{item.label}</span>
                      <span className="em-value" style={{ color: item.color }}>
                        {val % 1 === 0 ? val : val.toFixed(1)}{unit ?? 'g'}
                      </span>
                      <div className="em-bar">
                        <div className="em-fill" style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Vitamins */}
              <div className="accordion">
                <button className="accordion-header" onClick={() => setShowVitamins(v => !v)}>
                  <span>💊 Vitamins</span>
                  <span>{showVitamins ? '▲' : '▼'}</span>
                </button>
                {showVitamins && (
                  <div className="accordion-body">
                    {vitaminsAll.map(v => (
                      <NutrientRow key={v.id} label={v.label}
                        value={Math.round(v.value * 100) / 100}
                        unit={v.unit} dv={v.dv} />
                    ))}
                  </div>
                )}
              </div>

              {/* Minerals */}
              <div className="accordion">
                <button className="accordion-header" onClick={() => setShowMinerals(v => !v)}>
                  <span>⚗️ Minerals</span>
                  <span>{showMinerals ? '▲' : '▼'}</span>
                </button>
                {showMinerals && (
                  <div className="accordion-body">
                    {mineralsAll.map(m => (
                      <NutrientRow key={m.id} label={m.label}
                        value={Math.round((nutrients[m.id] ?? 0) * 10) / 10}
                        unit={m.unit} dv={m.dv} />
                    ))}
                  </div>
                )}
              </div>

              {/* Print label button */}
              <button className="print-label-btn" onClick={() => setShowLabel(true)}>
                🖨️ Download &amp; Print Nutrition Label
              </button>

              <p className="data-source">
                Data sourced from USDA FoodData Central · Values per 100g
              </p>
            </div>
          )}

          {/* ══ NUTRITION LABEL MODAL ══ */}
          {showLabel && detail && (
            <div className="label-overlay" onClick={e => { if (e.target === e.currentTarget) setShowLabel(false) }}>
              <div className="label-modal">
                <NutritionFactsLabel food={detail} nutrients={nutrients} />
                <div className="label-modal-actions">
                  <button className="label-close-btn" onClick={() => setShowLabel(false)}>✕ Close</button>
                  <button className="label-print-btn" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-wrap">
              <div className="spinner" />
              <p>Fetching nutrition data…</p>
            </div>
          )}

        </div>
      </main>

      <footer className="footer">
        NutriScan · Powered by USDA FoodData Central · For informational use only
      </footer>
    </div>
  )
}
