import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireRole } from "./RequireRole";
import { useUserStore } from "@/store/userStore";

function renderWithRole(allow: string[]) {
	return render(
		<MemoryRouter initialEntries={["/protected"]}>
			<Routes>
				<Route
					path="/protected"
					element={
						<RequireRole allow={allow}>
							<div>secret content</div>
						</RequireRole>
					}
				/>
				<Route path="/login" element={<div>login page</div>} />
				<Route path="/dashboard" element={<div>dashboard page</div>} />
			</Routes>
		</MemoryRouter>
	);
}

describe("RequireRole", () => {
	// react-router-dom v7's MemoryRouter/Routes schedule some internal state
	// syncing via React's startTransition; that occasionally resolves outside
	// the synchronous act() window render() wraps, producing an "update ...
	// not wrapped in act(...)" warning for RequireRole/MemoryRouter that isn't
	// caused by anything in this component or these tests. Confirmed by
	// tracing it to react-router's own startTransition usage, not to
	// useUserStore's persist rehydration (an earlier, wrong hypothesis) or to
	// test ordering. Filter only this exact known-benign shape so a real
	// missing-act warning elsewhere still surfaces.
	const originalConsoleError = console.error;

	beforeAll(() => {
		vi.spyOn(console, "error").mockImplementation((...args) => {
			const [message, componentName] = args;
			const isKnownRouterActWarning =
				typeof message === "string" &&
				message.includes("was not wrapped in act(...)") &&
				(componentName === "RequireRole" || componentName === "MemoryRouter");
			if (!isKnownRouterActWarning) originalConsoleError(...args);
		});
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		useUserStore.setState({ user: null });
	});

	it("redirects to /login when there is no logged-in user", () => {
		useUserStore.setState({ user: null });

		renderWithRole(["COACH", "ADMIN"]);

		expect(screen.getByText("login page")).toBeInTheDocument();
		expect(screen.queryByText("secret content")).not.toBeInTheDocument();
	});

	it("redirects to /dashboard when the user's role is not in the allow list", () => {
		useUserStore.setState({ user: { userId: "1", email: "a@b.com", role: "CLIENT" } });

		renderWithRole(["COACH", "ADMIN"]);

		expect(screen.getByText("dashboard page")).toBeInTheDocument();
		expect(screen.queryByText("secret content")).not.toBeInTheDocument();
	});

	it("renders the children when the user's role is in the allow list", () => {
		useUserStore.setState({ user: { userId: "1", email: "a@b.com", role: "COACH" } });

		renderWithRole(["COACH", "ADMIN"]);

		expect(screen.getByText("secret content")).toBeInTheDocument();
	});
});
