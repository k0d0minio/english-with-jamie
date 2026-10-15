import type { Answer, ExerciseData } from "@/lib/db/schema";
import { Check, X } from "lucide-react";

export function AnswersTable({ data, answers }: { data: ExerciseData; answers: Answer[] }) {
  const byItem = new Map(answers.map((a) => [a.itemIndex, a]));
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-muted">
        <tr>
          <th className="py-1 pr-3">#</th>
          <th className="py-1 pr-3">Item</th>
          <th className="py-1 pr-3">Student wrote</th>
          <th className="py-1 pr-3">Tries</th>
          <th className="py-1"> </th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((item, i) => {
          const a = byItem.get(i);
          const shown = a ? (item.kind === "mc" ? item.options[Number(a.response)] ?? a.response : a.response) : "—";
          return (
            <tr key={i} className="border-t border-line">
              <td className="py-2 pr-3 text-muted">{i + 1}</td>
              <td className="py-2 pr-3">{item.kind === "mc" ? item.prompt : item.prompt.replace("___", `[${item.answer}]`)}</td>
              <td className="py-2 pr-3 font-medium">{shown}</td>
              <td className="py-2 pr-3 text-muted">{a?.attempts ?? ""}</td>
              <td className="py-2">
                {a ? a.correct ? <Check className="h-4 w-4 text-ok" /> : <X className="h-4 w-4 text-danger" /> : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
