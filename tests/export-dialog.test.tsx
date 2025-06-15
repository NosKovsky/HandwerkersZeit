import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { ExportDialog } from "@/components/baustellen/export-dialog"
import * as actions from "@/app/baustellen/export/actions"

describe("ExportDialog", () => {
  it("ruft exportBaustellenData beim Klick auf Exportieren auf", async () => {
    const mockExport = vi
      .spyOn(actions, "exportBaustellenData")
      .mockResolvedValue({ success: true, data: "", filename: "test.csv" })

    render(<ExportDialog projectId="1" projectName="Test" />)

    // Dialog öffnen
    const trigger = screen.getByRole("button", { name: /Exportieren/i })
    await userEvent.click(trigger)

    // Klick auf Anker-Element verhindern
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})

    // Export-Button klicken
    const exportButton = screen.getAllByRole("button", { name: /Exportieren/i })[1]
    await userEvent.click(exportButton)

    expect(mockExport).toHaveBeenCalled()
  })
})
