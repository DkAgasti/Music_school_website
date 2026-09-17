import Table from "../ui/Table";

export default function DataTable({ columns, rows, emptyMessage = "No records found." }) {
  if (!rows?.length) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  return <Table columns={columns} rows={rows} />;
}
