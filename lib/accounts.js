// lib/accounts.js
export const AD_ACCOUNTS = [
  {
    id: 'utopia-jewellery',
    name: 'Utopia Jewellery',
    emoji: '💎',
    color: '#22c9b0',
    pubUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQc5iF6hGeSVATAemDOdE9h_e6aSVEmnOk14eTT8-Ciu3Y0YMM370grXwEAf2sum6lDUyfTPIdUNxTj/pub?output=csv',
  },

]

export function getAccount(id) {
  return AD_ACCOUNTS.find(a => a.id === id) || AD_ACCOUNTS[0]
}
