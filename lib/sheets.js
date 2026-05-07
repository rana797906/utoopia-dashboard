// lib/sheets.js
import Papa from 'papaparse'

export async function fetchSheetData(sheetId) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`
  const res = await fetch(url, { next: { revalidate: 300 } }) // cache 5 min
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
  const csv = await res.text()

  const { data, errors } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  })

  if (errors.length) console.warn('CSV parse warnings:', errors)

  return data.map(row => ({
    date: row['Date'] || '',
    campaign: row['Campaign name'] || '',
    cpm: parseFloat(row['CPM (cost per 1,000 impressions)']) || 0,
    ctr: parseFloat(row['CTR (all)']) || 0,
    impressions: parseInt(row['Impressions']?.replace(/,/g, '')) || 0,
    reach: parseInt(row['Reach']?.replace(/,/g, '')) || 0,
    spend: parseFloat(row['Amount spent']?.replace(/,/g, '')) || 0,
    costPerPurchase: parseFloat(row['Cost per purchase']?.replace(/,/g, '')) || 0,
    clicks: parseInt(row['Link clicks']?.replace(/,/g, '')) || 0,
    roas: parseFloat(row['Purchase ROAS (return on ad spend)']) || 0,
    purchases: parseInt(row['Purchases']?.replace(/,/g, '')) || 0,
    revenue: parseFloat(row['Purchases conversion value']?.replace(/,/g, '')) || 0,
  })).filter(r => r.date && r.spend > 0)
}

export function aggregateData(rows) {
  if (!rows.length) return null
  return {
    totalSpend: rows.reduce((s, r) => s + r.spend, 0),
    totalRevenue: rows.reduce((s, r) => s + r.revenue, 0),
    totalPurchases: rows.reduce((s, r) => s + r.purchases, 0),
    totalImpressions: rows.reduce((s, r) => s + r.impressions, 0),
    totalClicks: rows.reduce((s, r) => s + r.clicks, 0),
    totalReach: rows.reduce((s, r) => s + r.reach, 0),
    avgRoas: rows.reduce((s, r) => s + r.roas, 0) / rows.length,
    avgCpm: rows.reduce((s, r) => s + r.cpm, 0) / rows.length,
    avgCtr: rows.reduce((s, r) => s + r.ctr, 0) / rows.length,
    avgCostPerPurchase: rows.reduce((s, r) => s + (r.costPerPurchase || 0), 0) / rows.filter(r => r.costPerPurchase > 0).length || 0,
  }
}

export function getDateRange(rows, days) {
  const now = new Date()
  const cutoff = new Date(now.setDate(now.getDate() - days))
  return rows.filter(r => {
    const d = new Date(r.date)
    return !isNaN(d) && d >= cutoff
  })
}

export function groupByDate(rows) {
  const map = {}
  rows.forEach(r => {
    if (!map[r.date]) map[r.date] = { date: r.date, spend: 0, revenue: 0, purchases: 0, roas: 0, count: 0 }
    map[r.date].spend += r.spend
    map[r.date].revenue += r.revenue
    map[r.date].purchases += r.purchases
    map[r.date].roas += r.roas
    map[r.date].count++
  })
  return Object.values(map)
    .map(d => ({ ...d, roas: d.roas / d.count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30)
}

export function groupByCampaign(rows) {
  const map = {}
  rows.forEach(r => {
    if (!r.campaign) return
    if (!map[r.campaign]) map[r.campaign] = { campaign: r.campaign, spend: 0, revenue: 0, purchases: 0, clicks: 0, impressions: 0, roasSum: 0, count: 0 }
    map[r.campaign].spend += r.spend
    map[r.campaign].revenue += r.revenue
    map[r.campaign].purchases += r.purchases
    map[r.campaign].clicks += r.clicks
    map[r.campaign].impressions += r.impressions
    map[r.campaign].roasSum += r.roas
    map[r.campaign].count++
  })
  return Object.values(map)
    .map(c => ({ ...c, roas: c.roasSum / c.count }))
    .sort((a, b) => b.spend - a.spend)
}
