import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import {
  RiSearchLine, RiToggleLine, RiToggleFill,
  RiLockUnlockLine, RiDeleteBinLine,
} from 'react-icons/ri'

const D  = "'Orbitron', sans-serif"
const B  = "'Inter', sans-serif"
const CY = '#00f0ff'
const MG = '#ff00e5'
const GN = '#39ff14'
const RD = '#ff3860'
const CD = '#111827'
const C2 = '#1a2332'
const TX = '#e0e6ed'
const DM = '#7a8ba0'
const BR = 'rgba(0,240,255,0.15)'

const inputSt = {
  background: C2, border: `1px solid ${BR}`,
  borderRadius: '10px', padding: '9px 12px',
  fontSize: '13px', fontFamily: B, color: TX, outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

export default function Users() {
  const qc = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('All')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => api.get('/users', {
      params: {
        page, limit: 15,
        ...(search && { search }),
        ...(roleFilter !== 'All' && { role: roleFilter }),
      },
    }).then((r) => r.data.data),
  })

  const tog = useMutation({
    mutationFn: (id) => api.patch('/users/' + id + '/toggle'),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User status updated') },
  })
  const unl = useMutation({
    mutationFn: (id) => api.patch('/users/' + id + '/unlock'),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User unlocked') },
  })
  const del = useMutation({
    mutationFn: (id) => api.delete('/users/' + id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User deleted') },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  })

  const users = data?.users ?? []
  const pg = data?.pagination

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: B }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: D, fontSize: '1.4rem', fontWeight: 700, color: TX, letterSpacing: '0.04em', marginBottom: '4px' }}>
          Users
        </h1>
        <p style={{ fontSize: '13px', color: DM }}>Manage platform users</p>
      </div>

      {/* Filters */}
      <div style={{
        background: CD, border: `1px solid ${BR}`, borderRadius: '14px',
        padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <RiSearchLine style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: DM, fontSize: '14px', pointerEvents: 'none',
          }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email…"
            style={{ ...inputSt, paddingLeft: '36px', width: '100%' }}
            onFocus={(e) => { e.target.style.borderColor = CY; e.target.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = BR; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Role filter */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'user', 'admin'].map((r) => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }} style={{
              padding: '7px 14px', borderRadius: '8px', border: `1px solid ${roleFilter === r ? (r === 'admin' ? MG : CY) : BR}`,
              background: roleFilter === r ? (r === 'admin' ? 'rgba(255,0,229,0.1)' : 'rgba(0,240,255,0.1)') : 'transparent',
              color: roleFilter === r ? (r === 'admin' ? MG : CY) : DM,
              cursor: 'pointer', fontSize: '12px', fontFamily: B, fontWeight: 600,
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: CD, border: `1px solid ${BR}`, borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BR}` }}>
              {['User', 'Department', 'Role', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px',
                  fontSize: '10px', color: DM, fontFamily: B,
                  fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: `1px solid rgba(0,240,255,0.06)` }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} style={{ padding: '14px 16px' }}>
                    <div style={{ height: '14px', width: j === 0 ? '140px' : '80px', background: C2, borderRadius: '4px' }} />
                  </td>
                ))}
              </tr>
            ))}
            {!isLoading && users.map((u) => (
              <motion.tr
                key={u._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ borderBottom: `1px solid rgba(0,240,255,0.06)`, transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C2)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar + name */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: u.role === 'admin' ? 'rgba(255,0,229,0.1)' : 'rgba(0,240,255,0.1)',
                      border: `1px solid ${u.role === 'admin' ? 'rgba(255,0,229,0.25)' : BR}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: D, fontSize: '11px', fontWeight: 700,
                      color: u.role === 'admin' ? MG : CY,
                    }}>
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: TX, fontFamily: B }}>{u.name}</p>
                      <p style={{ fontSize: '11px', color: DM, fontFamily: B }}>{u.email}</p>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '12px 16px', fontSize: '12px', color: DM, fontFamily: B }}>
                  {u.department || '—'}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontFamily: D,
                    letterSpacing: '1px',
                    background: u.role === 'admin' ? 'rgba(255,0,229,0.1)' : 'rgba(0,240,255,0.1)',
                    color: u.role === 'admin' ? MG : CY,
                    border: `1px solid ${u.role === 'admin' ? 'rgba(255,0,229,0.25)' : BR}`,
                  }}>
                    {u.role}
                  </span>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontFamily: B,
                    background: u.isActive ? 'rgba(57,255,20,0.08)' : 'rgba(255,56,96,0.08)',
                    color: u.isActive ? GN : RD,
                    border: `1px solid ${u.isActive ? 'rgba(57,255,20,0.2)' : 'rgba(255,56,96,0.2)'}`,
                  }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => tog.mutate(u._id)}
                      title={u.isActive ? 'Deactivate' : 'Activate'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: u.isActive ? CY : DM, transition: 'color 0.15s' }}
                    >
                      {u.isActive ? <RiToggleFill /> : <RiToggleLine />}
                    </button>
                    <button
                      onClick={() => unl.mutate(u._id)}
                      title="Unlock account"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: DM, transition: 'color 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = GD)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = DM)}
                    >
                      <RiLockUnlockLine />
                    </button>
                    {u._id !== currentUser?._id && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${u.name}? This cannot be undone.`)) del.mutate(u._id)
                        }}
                        title="Delete user"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: DM, transition: 'color 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = RD)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = DM)}
                      >
                        <RiDeleteBinLine />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: DM, fontSize: '13px', fontFamily: B }}>
                  No users found
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
            <p style={{ fontSize: '12px', color: DM, fontFamily: B }}>{pg.total} users</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{
                padding: '5px 14px', borderRadius: '8px', border: `1px solid ${BR}`,
                background: 'transparent', color: page === 1 ? DM : TX,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px', fontFamily: B, opacity: page === 1 ? 0.4 : 1,
              }}>
                Prev
              </button>
              <span style={{ fontSize: '12px', color: TX, fontFamily: B }}>{page}/{pg.pages}</span>
              <button onClick={() => setPage((p) => Math.min(pg.pages, p + 1))} disabled={page === pg.pages} style={{
                padding: '5px 14px', borderRadius: '8px', border: `1px solid ${BR}`,
                background: 'transparent', color: page === pg.pages ? DM : TX,
                cursor: page === pg.pages ? 'not-allowed' : 'pointer',
                fontSize: '12px', fontFamily: B, opacity: page === pg.pages ? 0.4 : 1,
              }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
