// pages/api/sheet-data.js
import { fetchSheetData, aggregateData, getDateRange, groupByDate, groupByCampaign } from '../../lib/sheets'
import { AD_ACCOUNTS } from '../../lib/accounts'

export default async function handler(req, res) {
  const { accountId, range = '7' } = req.query
  const account = AD_ACCOUNTS.find(a => a.id === accountId)
  if (!account) return res.status(404).json({ error: 'Account not found' })

  try {
    const allRows = await fetchSheetData(account.pubUrl)
    const days = parseInt(range)
    const filtered = days === 0 ? allRows : getDateRange(allRows, days)

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.json({
      summary: aggregateData(filtered),
      byDate: groupByDate(filtered),
      byCampaign: groupByCampaign(filtered),
      totalRows: filtered.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
