import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServerTable } from "./ServerTable";
import type { Column, ServerQuery } from "./types";

interface Row {
	id: number;
	name: string;
}

const columns: Column<Row>[] = [
	{ key: "name", label: "Name", sortable: true },
];

const baseQuery: ServerQuery = {
	pageNumber: 1,
	pageSize: 10,
};

function renderTable(overrides: Partial<React.ComponentProps<typeof ServerTable<Row>>> = {}) {
	const setQuery = vi.fn();
	const props = {
		data: [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		],
		columns,
		totalCount: 2,
		loading: false,
		query: baseQuery,
		setQuery,
		getRowId: (row: Row) => row.id.toString(),
		...overrides,
	};
	render(<ServerTable<Row> {...props} />);
	return { setQuery, props };
}

describe("ServerTable", () => {
	it("renders a row per data item", () => {
		renderTable();

		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
	});

	it("shows a loading row instead of data while loading", () => {
		renderTable({ loading: true });

		expect(screen.getByText("Loading...")).toBeInTheDocument();
		expect(screen.queryByText("Alice")).not.toBeInTheDocument();
	});

	it("shows an empty state when there is no data", () => {
		renderTable({ data: [], totalCount: 0 });

		expect(screen.getByText("No results.")).toBeInTheDocument();
	});

	it("calls setQuery with the search text and resets to page 1", async () => {
		const user = userEvent.setup();
		const { setQuery } = renderTable({ query: { ...baseQuery, pageNumber: 3 } });

		await user.type(screen.getByPlaceholderText("Search..."), "a");

		expect(setQuery).toHaveBeenCalledWith(
			expect.objectContaining({ searchText: "a", pageNumber: 1 })
		);
	});

	it("sorts ascending on first header click, then flips on the same column", async () => {
		const user = userEvent.setup();
		const { setQuery } = renderTable();

		await user.click(screen.getByRole("columnheader", { name: "Name" }));

		expect(setQuery).toHaveBeenCalledWith(
			expect.objectContaining({ orderByProperty: "name", ascending: true })
		);
	});

	it("flips sort direction when the already-sorted column is clicked again", async () => {
		const user = userEvent.setup();
		const { setQuery } = renderTable({
			query: { ...baseQuery, orderByProperty: "name", ascending: true },
		});

		await user.click(screen.getByRole("columnheader", { name: "Name ↑" }));

		expect(setQuery).toHaveBeenCalledWith(
			expect.objectContaining({ orderByProperty: "name", ascending: false })
		);
	});

	it("disables the Previous button on the first page and enables Next when more pages exist", () => {
		renderTable({ totalCount: 25, query: { ...baseQuery, pageNumber: 1, pageSize: 10 } });

		expect(screen.getByText("Previous")).toBeDisabled();
		expect(screen.getByText("Next")).not.toBeDisabled();
	});

	it("calls setQuery with the next page number when Next is clicked", async () => {
		const user = userEvent.setup();
		const { setQuery } = renderTable({
			totalCount: 25,
			query: { ...baseQuery, pageNumber: 1, pageSize: 10 },
		});

		await user.click(screen.getByText("Next"));

		expect(setQuery).toHaveBeenCalledWith(expect.objectContaining({ pageNumber: 2 }));
	});
});
