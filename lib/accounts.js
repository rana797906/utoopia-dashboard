// lib/accounts.js
export const AD_ACCOUNTS = [
  {
    id: 'house-of-books',
    name: 'House of Books',
    emoji: '📚',
    color: '#6c63ff',
    sheetId: '1Iv00aeYBVPaFHWekmr02tLewFAjDrx6qPYgxbOFto0s',
  },
  {
    id: 'murder-mystery',
    name: 'Murder Mystery',
    emoji: '🔍',
    color: '#e05c5c',
    sheetId: '18qEYzpioyM-bpq7zZ_Ai9faiHAgug0iTWg2kQGAfcBk',
  },
  {
    id: 'utopia-jewellery',
    name: 'Utopia Jewellery',
    emoji: '💎',
    color: '#22c9b0',
    sheetId: '1mb9T4nnqBcdlvEANPbnEJQEYjoe0YFOjBNEMuvshfD4',
  },
  {
    id: 'cubiq',
    name: 'Cubiq',
    emoji: '🟦',
    color: '#f5a623',
    sheetId: '1nXDJNTKJFxMaJmB8XSP0HsGaG7VhkF989H9vJ40LdWY',
  },
  {
    id: 'beauty-botanics',
    name: 'Beauty Botanics',
    emoji: '🌿',
    color: '#22c98a',
    sheetId: '1dGNWVGITIDw3ZKsVj2PoGb4W3PdGsvSrf8BgTgIlPGI',
  },
]

export function getAccount(id) {
  return AD_ACCOUNTS.find(a => a.id === id) || AD_ACCOUNTS[0]
}
