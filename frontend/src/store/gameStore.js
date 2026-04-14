import { create } from 'zustand'

export const useGameStore = create((set) => ({
  sessionId: null,
  currentRound: null,
  totalScore: 0,
  roundResults: [],

  setSession: (sessionId) => set({ sessionId }),
  setCurrentRound: (round) => set({ currentRound: round }),

  addRoundResult: (result) =>
    set((state) => ({
      roundResults: [...state.roundResults, result],
      totalScore: state.totalScore + (result.score || 0),
    })),

  resetGame: () =>
    set({
      sessionId: null,
      currentRound: null,
      totalScore: 0,
      roundResults: [],
    }),
}))
