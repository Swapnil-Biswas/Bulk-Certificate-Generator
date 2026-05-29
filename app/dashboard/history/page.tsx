import { History, Download, ExternalLink } from "lucide-react";

const mockHistory = [
  {
    id: "1",
    name: "Summer Workshop 2026",
    date: "2026-05-28",
    count: 45,
    status: "Completed",
  },
  {
    id: "2",
    name: "Employee of the Month",
    date: "2026-05-25",
    count: 12,
    status: "Completed",
  },
  {
    id: "3",
    name: "React Advanced Certification",
    date: "2026-05-20",
    count: 128,
    status: "Completed",
  },
];

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Generation History</h1>
        <p className="mt-2 text-lg text-slate-500">
          Track and download your previous certificate batches
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Batch Name</th>
              <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Count</th>
              <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockHistory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <History className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900">{item.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-slate-500 font-medium">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {item.count} Certificates
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition" title="Download ZIP">
                      <Download className="h-5 w-5" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition" title="View Details">
                      <ExternalLink className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mockHistory.length === 0 && (
          <div className="py-20 text-center">
            <History className="mx-auto h-12 w-12 text-slate-200" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No history yet</h3>
            <p className="mt-1 text-slate-500">Start generating certificates to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
