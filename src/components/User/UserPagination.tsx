import { Button } from "@/components/ui/button";

export default function UserPagination() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded border border-gray-300 bg-white p-5 shadow-sm md:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold">1-10</span> of{" "}
        <span className="font-semibold">125</span> users
      </p>

      <div className="flex gap-2">
        <Button variant="outline">Previous</Button>

        <Button>1</Button>

        <Button variant="outline">2</Button>

        <Button variant="outline">3</Button>

        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
}