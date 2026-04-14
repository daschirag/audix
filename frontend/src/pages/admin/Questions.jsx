import api from '../../api/axios'
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  RiDeleteBinLine, RiToggleLine, RiToggleFill,
  RiUpload2Line, RiFileLine, RiCloseLine, RiCheckLine,
  RiAddLine, RiSearchLine,
} from 'react-icons/ri'

/* ── design tokens ──────────────────────────────────────────────── */
const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const MG = '#ff00e5'
const GN = '#39ff14'
const RD = '#ff3860'
const GD = '#ffd700'
const CD = '#111827'
const C2 = '#1a2332'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const diffColor = { easy: GN, medium: GD, hard: RD }

const ROUND_TYPES = [
  'multiple-choice', // rounds 1-6 default
]

const DEPARTMENTS = ['Engineering','HR','Finance','Marketing','Operations','Legal','Executive','Other']

const inputSt = {
  width: '100%', background: C2, border: `1px solid ${BR}`,
  borderRadius: '10px', padding: '10px 14px',
  fontSize: '13px', fontFamily: B, color: TX, outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const focusSt = (e) => {
  e.target.style.borderColor = CY
  e.target.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.1)'
}
const blurSt = (e) => {
  e.target.style.borderColor = BR
  e.target.style.boxShadow = 'none'
}

const labelSt = {
  display: 'block', fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: DM, fontFamily: B, marginBottom: '5px',
}

/* ─────────────────────────────────────────────────────────────────── */
/* TAB 1: QUESTION LIST                                                */
/* ─────────────────────────────────────────────────────────────────── */
function QuestionList() {
  const qc = useQueryClient()
  const [round, setRound] = useState('All')
  const [diff, setDiff] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const params = {
    page, limit: 20,
    ...(round !== 'All' && { round }),
    ...(diff !== 'All' && { difficulty: diff }),
    ...(search && { search }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['questions', params],
    queryFn: () => api.get('/questions', { params }).then((r) => r.data.data),
  })

  const del = useMutation({
    mutationFn: (id) => api.delete('/questions/' + id),
    onSuccess: () => { qc.invalidateQueries(['questions']); toast.success('Question deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  })

  const tog = useMutation({
    mutationFn: (id) => api.patch('/questions/' + id + '/toggle'),
    onSuccess: () => qc.invalidateQueries(['questions']),
  })

  const qs = data?.questions ?? []
  const pg = data?.pagination

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Filters */}
      <div style={{
        background: CD, border: `1px solid ${BR}`, borderRadius: '14px', padding: '14px 18px',
        display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
      }}>
        {/* Round filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', '1', '2', '3', '4', '5', '6'].map((r) => (
            <button key={r} onClick={() => { setRound(r); setPage(1) }} style={{
              padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontFamily: B, fontWeight: 600, transition: 'all 0.15s',
              background: round === r ? 'rgba(0,240,255,0.12)' : 'transparent',
              color: round === r ? CY : DM,
              border: `1px solid ${round === r ? 'rgba(0,240,255,0.3)' : BR}`,
            }}>
              {r === 'All' ? 'All' : `R${r}`}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'easy', 'medium', 'hard'].map((d) => (
            <button key={d} onClick={() => { setDiff(d); setPage(1) }} style={{
              padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontFamily: B, fontWeight: 600, textTransform: 'capitalize',
              transition: 'all 0.15s',
              background: diff === d ? 'rgba(0,240,255,0.12)' : 'transparent',
              color: diff === d ? CY : DM,
              border: `1px solid ${diff === d ? 'rgba(0,240,255,0.3)' : BR}`,
            }}>
              {d}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <RiSearchLine style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: DM, fontSize: '14px',
          }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search questions…"
            style={{ ...inputSt, paddingLeft: '34px', padding: '8px 12px 8px 34px' }}
            onFocus={focusSt} onBlur={blurSt}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: CD, border: `1px solid ${BR}`, borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BR}` }}>
              {['Round', 'Question', 'Type', 'Difficulty', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px',
                  fontSize: '11px', color: DM, fontFamily: B, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: `1px solid rgba(0,240,255,0.06)` }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} style={{ padding: '14px 16px' }}>
                    <div style={{ height: '14px', width: '80px', background: C2, borderRadius: '4px', animation: 'shimmer 1.5s infinite' }} />
                  </td>
                ))}
              </tr>
            ))}
            {!isLoading && qs.map((q) => (
              <motion.tr
                key={q._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  borderBottom: `1px solid rgba(0,240,255,0.06)`,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C2)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontFamily: D, fontSize: '10px', fontWeight: 700, color: MG,
                    padding: '2px 8px', borderRadius: '20px', letterSpacing: '2px',
                    background: 'rgba(255,0,229,0.08)', border: '1px solid rgba(255,0,229,0.2)',
                  }}>
                    R{q.round}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '280px' }}>
                  <p style={{ color: TX, fontSize: '12px', fontFamily: B, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.question}
                  </p>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                    background: C2, color: DM, border: `1px solid ${BR}`, fontFamily: B,
                  }}>
                    {q.type}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textTransform: 'capitalize', fontSize: '12px', fontWeight: 600, color: diffColor[q.difficulty] || DM, fontFamily: B }}>
                  {q.difficulty}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600,
                    background: q.isActive ? 'rgba(57,255,20,0.08)' : 'rgba(122,139,160,0.08)',
                    color: q.isActive ? GN : DM,
                    border: `1px solid ${q.isActive ? 'rgba(57,255,20,0.2)' : BR}`,
                  }}>
                    {q.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => tog.mutate(q._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: q.isActive ? CY : DM, fontSize: '20px', transition: 'color 0.15s' }}>
                      {q.isActive ? <RiToggleFill /> : <RiToggleLine />}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this question?')) del.mutate(q._id)
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: DM, fontSize: '16px', transition: 'color 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = RD)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = DM)}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {!isLoading && qs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: DM, fontSize: '13px', fontFamily: B }}>
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pg?.pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderTop: `1px solid ${BR}`,
          }}>
            <p style={{ fontSize: '12px', color: DM, fontFamily: B }}>{pg.total} total</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${BR}`, background: 'transparent', color: page === 1 ? DM : TX, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontFamily: B, opacity: page === 1 ? 0.4 : 1 }}>
                Prev
              </button>
              <span style={{ fontSize: '12px', color: TX, fontFamily: B }}>
                {page}/{pg.pages}
              </span>
              <button onClick={() => setPage((p) => Math.min(pg.pages, p + 1))} disabled={page === pg.pages}
                style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${BR}`, background: 'transparent', color: page === pg.pages ? DM : TX, cursor: page === pg.pages ? 'not-allowed' : 'pointer', fontSize: '12px', fontFamily: B, opacity: page === pg.pages ? 0.4 : 1 }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/* TAB 2: ADD MANUAL                                                   */
/* ─────────────────────────────────────────────────────────────────── */
function AddManual() {
  const qc = useQueryClient()
  const [roundNum, setRoundNum] = useState(1)
  const [difficulty, setDifficulty] = useState('medium')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [explanation, setExplanation] = useState('')

  const addMutation = useMutation({
    mutationFn: (payload) => api.post('/questions', payload),
    onSuccess: () => {
      qc.invalidateQueries(['questions'])
      toast.success(`✓ Question added to Round ${roundNum}`)
      setQuestion('')
      setExplanation('')
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add question'),
  })

  const setCorrect = (i) => {
    setOptions((prev) => prev.map((o, idx) => ({ ...o, isCorrect: idx === i })))
  }

  const setOptionText = (i, text) => {
    setOptions((prev) => prev.map((o, idx) => idx === i ? { ...o, text } : o))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!question.trim()) return toast.error('Question text is required')
    if (options.some((o) => !o.text.trim())) return toast.error('All options must have text')
    if (!options.some((o) => o.isCorrect)) return toast.error('Mark at least one correct answer')

    addMutation.mutate({
      round: roundNum,
      type: 'multiple-choice',
      difficulty,
      question: question.trim(),
      options,
      explanation: explanation.trim() || undefined,
    })
  }

  const letters = ['A', 'B', 'C', 'D']

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Round selector */}
      <div>
        <label style={labelSt}>Round Number</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4, 5, 6].map((r) => (
            <button key={r} type="button" onClick={() => setRoundNum(r)} style={{
              width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer',
              fontFamily: D, fontWeight: 700, fontSize: '13px', transition: 'all 0.15s',
              background: roundNum === r ? `linear-gradient(135deg,${CY},#0090ff)` : C2,
              color: roundNum === r ? '#000' : DM,
              border: `1px solid ${roundNum === r ? CY : BR}`,
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty selector */}
      <div>
        <label style={labelSt}>Difficulty</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['easy', 'medium', 'hard'].map((d) => (
            <button key={d} type="button" onClick={() => setDifficulty(d)} style={{
              padding: '8px 20px', borderRadius: '10px', cursor: 'pointer',
              fontFamily: B, fontWeight: 600, fontSize: '13px', textTransform: 'capitalize',
              transition: 'all 0.15s',
              background: difficulty === d ? diffColor[d] + '18' : C2,
              color: difficulty === d ? diffColor[d] : DM,
              border: `1px solid ${difficulty === d ? diffColor[d] + '40' : BR}`,
            }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Question text */}
      <div>
        <label style={labelSt}>Question Text</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question…"
          rows={3}
          style={{ ...inputSt, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={focusSt} onBlur={blurSt}
        />
      </div>

      {/* Options */}
      <div>
        <label style={labelSt}>Answer Options (click radio to mark correct)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCorrect(i)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  fontFamily: D, fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: opt.isCorrect ? GN : C2,
                  color: opt.isCorrect ? '#000' : DM,
                  border: `1px solid ${opt.isCorrect ? GN : BR}`,
                }}
              >
                {opt.isCorrect ? <RiCheckLine /> : letters[i]}
              </button>
              <input
                type="text"
                value={opt.text}
                onChange={(e) => setOptionText(i, e.target.value)}
                placeholder={`Option ${letters[i]}`}
                style={{ ...inputSt, flex: 1, borderColor: opt.isCorrect ? 'rgba(57,255,20,0.4)' : BR }}
                onFocus={focusSt} onBlur={(e) => {
                  e.target.style.borderColor = opt.isCorrect ? 'rgba(57,255,20,0.4)' : BR
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label style={{ ...labelSt }}>
          Explanation <span style={{ color: 'rgba(122,139,160,0.5)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain why the correct answer is correct…"
          rows={2}
          style={{ ...inputSt, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={focusSt} onBlur={blurSt}
        />
      </div>

      <button
        type="submit"
        disabled={addMutation.isPending}
        style={{
          background: addMutation.isPending ? 'rgba(0,240,255,0.2)' : `linear-gradient(135deg,${CY},#0090ff)`,
          color: '#000', border: 'none', borderRadius: '12px',
          padding: '14px 32px', fontFamily: D, fontWeight: 700,
          fontSize: '0.9rem', letterSpacing: '1px',
          cursor: addMutation.isPending ? 'not-allowed' : 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          alignSelf: 'flex-start',
        }}
        onMouseEnter={(e) => {
          if (!addMutation.isPending) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,240,255,0.35)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <RiAddLine style={{ fontSize: '18px' }} />
        Add Question
      </button>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/* TAB 3: BULK UPLOAD                                                  */
/* ─────────────────────────────────────────────────────────────────── */

const SAMPLE_JSON = `[
  {
    "round": 1,
    "type": "multiple-choice",
    "difficulty": "easy",
    "question": "Which of these is a sign of a phishing email?",
    "options": [
      { "text": "Sender address matches the domain", "isCorrect": false },
      { "text": "Urgent language asking you to click a link", "isCorrect": true },
      { "text": "Company logo in the signature", "isCorrect": false },
      { "text": "Proper grammar and spelling", "isCorrect": false }
    ],
    "explanation": "Phishing emails often create urgency to pressure you into acting quickly."
  }
]`

function BulkUpload() {
  const qc = useQueryClient()
  const [subTab, setSubTab] = useState('json')
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const fileRef = useRef(null)

  const uploadJson = useMutation({
    mutationFn: (data) => api.post('/questions/bulk', data),
    onSuccess: (res) => {
      const d = res.data?.data || res.data
      setResult({ ok: true, msg: `✓ ${d?.inserted ?? d?.count ?? '?'} question(s) inserted` })
      qc.invalidateQueries(['questions'])
      setJsonText('')
    },
    onError: (e) => {
      setResult({ ok: false, msg: `✗ ${e.response?.data?.message || 'Upload failed'}` })
    },
  })

  const uploadCsv = useMutation({
    mutationFn: (formData) => api.post('/questions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: (res) => {
      const d = res.data?.data || res.data
      setResult({ ok: true, msg: `✓ ${d?.inserted ?? d?.count ?? '?'} question(s) inserted` })
      qc.invalidateQueries(['questions'])
      setCsvFile(null)
    },
    onError: (e) => {
      setResult({ ok: false, msg: `✗ ${e.response?.data?.message || 'Upload failed'}` })
    },
  })

  const validateJson = () => {
    setJsonError('')
    setResult(null)
    try {
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) { setJsonError('Must be a JSON array'); return false }
      if (parsed.length === 0) { setJsonError('Array cannot be empty'); return false }
      return parsed
    } catch (err) {
      setJsonError('Invalid JSON: ' + err.message)
      return false
    }
  }

  const handleJsonUpload = () => {
    const parsed = validateJson()
    if (parsed) uploadJson.mutate(parsed)
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      setCsvFile(file)
      setResult(null)
    } else {
      toast.error('Please drop a CSV file')
    }
  }

  const handleCsvUpload = () => {
    if (!csvFile) return toast.error('Select a CSV file first')
    const fd = new FormData()
    fd.append('file', csvFile)
    uploadCsv.mutate(fd)
  }

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Sub-tabs */}
      <div style={{
        display: 'flex', background: C2, borderRadius: '10px', padding: '4px', gap: '4px',
        border: `1px solid ${BR}`, width: 'fit-content',
      }}>
        {['json', 'csv'].map((t) => (
          <button key={t} type="button" onClick={() => { setSubTab(t); setResult(null) }} style={{
            padding: '8px 20px', borderRadius: '7px', border: 'none', cursor: 'pointer',
            fontFamily: D, fontWeight: 700, fontSize: '12px', letterSpacing: '1px',
            textTransform: 'uppercase', transition: 'all 0.2s',
            background: subTab === t ? `linear-gradient(135deg,${CY},#0090ff)` : 'transparent',
            color: subTab === t ? '#000' : DM,
          }}>
            {t}
          </button>
        ))}
      </div>

      {subTab === 'json' && (
        <>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={labelSt}>JSON Array of Questions</label>
              <button type="button" onClick={() => setJsonText(SAMPLE_JSON)} style={{
                background: 'none', border: 'none', color: CY, cursor: 'pointer',
                fontSize: '12px', fontFamily: B, textDecoration: 'underline',
              }}>
                Load sample
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setJsonError('') }}
              placeholder={`[\n  { "round": 1, "type": "multiple-choice", ... }\n]`}
              rows={12}
              style={{
                ...inputSt, resize: 'vertical', lineHeight: 1.5,
                fontFamily: "'Courier New', monospace", fontSize: '12px',
                borderColor: jsonError ? RD : BR,
              }}
              onFocus={focusSt} onBlur={blurSt}
            />
            {jsonError && (
              <p style={{ fontSize: '12px', color: RD, fontFamily: B, marginTop: '6px' }}>
                ✗ {jsonError}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => validateJson() && toast.success('JSON is valid!')} style={{
              padding: '11px 22px', borderRadius: '10px', border: `1px solid ${CY}`,
              background: 'transparent', color: CY, cursor: 'pointer',
              fontFamily: D, fontWeight: 700, fontSize: '12px', letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,240,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Validate
            </button>
            <button type="button" onClick={handleJsonUpload} disabled={uploadJson.isPending || !jsonText.trim()} style={{
              padding: '11px 24px', borderRadius: '10px', border: 'none',
              background: !jsonText.trim() ? 'rgba(0,240,255,0.15)' : `linear-gradient(135deg,${CY},#0090ff)`,
              color: !jsonText.trim() ? DM : '#000',
              cursor: !jsonText.trim() ? 'not-allowed' : 'pointer',
              fontFamily: D, fontWeight: 700, fontSize: '12px', letterSpacing: '1px',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              if (jsonText.trim()) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,240,255,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <RiUpload2Line style={{ fontSize: '16px' }} />
              Upload Questions
            </button>
          </div>
        </>
      )}

      {subTab === 'csv' && (
        <>
          {/* Drag & drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? CY : BR}`,
              borderRadius: '14px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(0,240,255,0.04)' : C2,
              transition: 'all 0.2s',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileDrop}
            />
            {csvFile ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <RiFileLine style={{ color: CY, fontSize: '24px' }} />
                <span style={{ color: TX, fontFamily: B, fontSize: '14px' }}>{csvFile.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setCsvFile(null) }}
                  style={{ background: 'none', border: 'none', color: DM, cursor: 'pointer', fontSize: '16px' }}>
                  <RiCloseLine />
                </button>
              </div>
            ) : (
              <>
                <RiUpload2Line style={{ color: DM, fontSize: '32px', marginBottom: '10px' }} />
                <p style={{ color: TX, fontFamily: B, fontSize: '14px', marginBottom: '4px' }}>
                  Drop CSV file here or click to browse
                </p>
                <p style={{ color: DM, fontFamily: B, fontSize: '12px' }}>
                  Supports .csv files
                </p>
              </>
            )}
          </div>

          <button type="button" onClick={handleCsvUpload} disabled={!csvFile || uploadCsv.isPending} style={{
            padding: '13px 28px', borderRadius: '12px', border: 'none', alignSelf: 'flex-start',
            background: !csvFile ? 'rgba(0,240,255,0.1)' : `linear-gradient(135deg,${CY},#0090ff)`,
            color: !csvFile ? DM : '#000',
            cursor: !csvFile ? 'not-allowed' : 'pointer',
            fontFamily: D, fontWeight: 700, fontSize: '12px', letterSpacing: '1px',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}>
            <RiUpload2Line style={{ fontSize: '16px' }} />
            Upload CSV
          </button>
        </>
      )}

      {/* Result banner */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 18px', borderRadius: '10px',
            background: result.ok ? 'rgba(57,255,20,0.07)' : 'rgba(255,56,96,0.07)',
            border: `1px solid ${result.ok ? 'rgba(57,255,20,0.3)' : 'rgba(255,56,96,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          {result.ok
            ? <RiCheckLine style={{ color: GN, fontSize: '18px', flexShrink: 0 }} />
            : <RiCloseLine style={{ color: RD, fontSize: '18px', flexShrink: 0 }} />}
          <p style={{ fontSize: '13px', color: TX, fontFamily: B }}>{result.msg}</p>
        </motion.div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────── */
/* MAIN QUESTIONS PAGE                                                 */
/* ─────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'list',   label: 'Question List' },
  { id: 'add',    label: 'Add Manual' },
  { id: 'upload', label: 'Bulk Upload' },
]

export default function Questions() {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: B }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: D, fontSize: '1.4rem', fontWeight: 700, color: TX, letterSpacing: '0.04em', marginBottom: '4px' }}>
          Questions
        </h1>
        <p style={{ fontSize: '13px', color: DM }}>Manage and add quiz questions</p>
      </div>

      {/* Tab pills */}
      <div style={{
        display: 'flex', gap: '4px',
        background: C2, borderRadius: '12px', padding: '4px',
        border: `1px solid ${BR}`, width: 'fit-content',
      }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '9px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontFamily: B, fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
            background: activeTab === id ? `linear-gradient(135deg,${CY},#0090ff)` : 'transparent',
            color: activeTab === id ? '#000' : DM,
            boxShadow: activeTab === id ? '0 0 16px rgba(0,240,255,0.25)' : 'none',
          }}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'list'   && <QuestionList />}
          {activeTab === 'add'    && <AddManual />}
          {activeTab === 'upload' && <BulkUpload />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
