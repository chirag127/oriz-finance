import assert from 'node:assert/strict'
import { describe, it } from 'vitest'
import { calculateSIP, calculateEMI, calculateEMIFull, calculateCompound } from '../lib/finmath'

describe('financial calculations', () => {
  it('keeps zero-rate SIP contributions and yearly totals consistent', () => {
    assert.deepEqual(calculateSIP(1000, 0, 2), {
      investedAmount: 24000, totalValue: 24000, wealthGained: 0,
      yearlyBreakdown: [
        { year: 1, invested: 12000, value: 12000, gains: 0 },
        { year: 2, invested: 24000, value: 24000, gains: 0 },
      ],
    })
  })

  it('compounds SIP contributions at the start of each month', () => {
    let expected = 0
    for (let month = 0; month < 12; month++) expected = (expected + 1000) * 1.01
    const result = calculateSIP(1000, 12, 1)
    assert.equal(result.totalValue, Math.round(expected))
    assert.equal(result.wealthGained, Math.round(expected - 12000))
    assert.equal(result.yearlyBreakdown[0].value, result.totalValue)
  })

  it('repays a zero-interest loan without creating interest', () => {
    assert.deepEqual(calculateEMI(12000, 0, 1), { emi: 1000, totalInterest: 0, totalPayment: 12000 })
    const result = calculateEMIFull(12000, 0, 1)
    assert.equal(result.amortization.length, 12)
    assert.equal(result.amortization[0].opening, 12000)
    assert.equal(result.amortization[11].closing, 0)
    assert.equal(result.totalInterest, 0)
    assert.equal(result.amortization.reduce((sum, row) => sum + row.principal, 0), 12000)
  })

  it('matches a known amortizing loan and closes its balance', () => {
    const summary = calculateEMI(100000, 12, 1)
    assert.deepEqual(summary, { emi: 8885, totalInterest: 6619, totalPayment: 106619 })
    const full = calculateEMIFull(100000, 12, 1)
    assert.equal(full.emi, summary.emi)
    assert.equal(full.totalPayment, summary.totalPayment)
    assert.equal(full.amortization[0].interest, 1000)
    assert.equal(full.amortization[11].closing, 0)
  })

  it('uses the selected compounding frequency', () => {
    assert.equal(calculateCompound(10000, 12, 2, 'annually').maturityValue, 12544)
    assert.equal(calculateCompound(10000, 12, 2, 'monthly').maturityValue, 12697)
    assert.equal(calculateCompound(10000, 0, 2, 'daily').totalInterest, 0)
  })
})