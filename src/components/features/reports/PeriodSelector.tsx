"use client";

import { Calendar, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  REPORT_PERIOD_OPTIONS,
  type ReportPeriodType,
  validateCustomDateRange,
} from "~/lib/reports/periods";

interface PeriodSelectorProps {
  selectedPeriod: ReportPeriodType;
  onSelectPeriod: (period: ReportPeriodType) => void;
  customStart: string;
  customEnd: string;
  onApplyCustomRange: (start: string, end: string) => void;
}

export function PeriodSelector({
  selectedPeriod,
  onSelectPeriod,
  customStart,
  customEnd,
  onApplyCustomRange,
}: PeriodSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempStart, setTempStart] = useState(customStart);
  const [tempEnd, setTempEnd] = useState(customEnd);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeOption =
    REPORT_PERIOD_OPTIONS.find((opt) => opt.type === selectedPeriod) ||
    REPORT_PERIOD_OPTIONS[0];

  const handleSelect = (periodType: ReportPeriodType) => {
    if (periodType === "CUSTOM") {
      setTempStart(customStart);
      setTempEnd(customEnd);
      setErrorMsg(null);
      setDialogOpen(true);
    } else {
      onSelectPeriod(periodType);
    }
  };

  const handleSaveCustom = () => {
    if (!tempStart || !tempEnd) {
      setErrorMsg("Tanggal mulai dan tanggal akhir wajib diisi.");
      return;
    }

    const validation = validateCustomDateRange(tempStart, tempEnd);
    if (!validation.valid) {
      setErrorMsg(validation.error || "Rentang tanggal tidak valid.");
      return;
    }

    setErrorMsg(null);
    onApplyCustomRange(tempStart, tempEnd);
    onSelectPeriod("CUSTOM");
    setDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{activeOption.label}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          {REPORT_PERIOD_OPTIONS.map((opt) => {
            const isSelected = opt.type === selectedPeriod;
            return (
              <DropdownMenuItem
                key={opt.type}
                onClick={() => handleSelect(opt.type)}
                className="flex items-center justify-between cursor-pointer py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Range Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Pilih Rentang Tanggal Kustom
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
              Tentukan periode tanggal mulai dan selesai untuk menganalisis
              laporan keuangan Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {errorMsg && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="custom-start-date"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Tanggal Mulai
              </Label>
              <Input
                id="custom-start-date"
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="custom-end-date"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Tanggal Akhir
              </Label>
              <Input
                id="custom-end-date"
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveCustom}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              Terapkan Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
