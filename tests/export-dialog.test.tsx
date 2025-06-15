import { render, fireEvent, screen } from '@testing-library/react'
import { ExportDialog } from '@/components/baustellen/export-dialog'
import { vi } from 'vitest'
import '@testing-library/jest-dom'

vi.mock('@/app/baustellen/export/actions', () => ({
  exportBaustellenData: vi.fn(async () => ({ success: true, data: 'col1,col2\n', filename: 'data.csv' }))
}))

describe('ExportDialog', () => {
  it('lädt CSV herunter', async () => {
    render(<ExportDialog projectId="1" projectName="Test" />)
    fireEvent.click(screen.getByRole('button', { name: /Exportieren/i }))
    expect(await screen.findByText('Baustelle exportieren')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Exportieren/i }))
    // Da jsdom keine Download-Events unterstützt, prüfen wir, dass die Mock-Funktion aufgerufen wurde
    const { exportBaustellenData } = await import('@/app/baustellen/export/actions')
    expect(exportBaustellenData).toHaveBeenCalled()
  })
})
