import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BaseApi from "./base.api";
import { useUserStore } from "@/store/userStore";

class TestApi extends BaseApi {
	constructor() {
		super("/test");
	}

	get rejectedHandler() {
		// axios doesn't expose registered interceptors publicly; reach into the
		// internal handlers array to invoke the one registered in setupInterceptors().
		return (this.axiosInstance.interceptors.response as unknown as {
			handlers: { rejected: (error: unknown) => Promise<never> }[];
		}).handlers[0].rejected;
	}
}

function setLocation(pathname: string) {
	const location = { pathname, href: `http://localhost${pathname}` };
	Object.defineProperty(window, "location", {
		configurable: true,
		writable: true,
		value: location,
	});
	return location;
}

describe("BaseApi response interceptor", () => {
	const originalLocation = window.location;

	beforeEach(() => {
		useUserStore.setState({ user: { userId: "1", email: "a@b.com", role: "COACH" } });
	});

	afterEach(() => {
		Object.defineProperty(window, "location", {
			configurable: true,
			writable: true,
			value: originalLocation,
		});
		useUserStore.setState({ user: null });
	});

	it("clears the user store and redirects to /login on a 401 outside public pages", async () => {
		const location = setLocation("/dashboard");
		const api = new TestApi();

		await expect(
			api.rejectedHandler({ response: { status: 401, data: {} } })
		).rejects.toBeDefined();

		// The redirect is a synchronous statement, set before the interceptor's
		// rejected promise settles.
		expect(location.href).toBe("/login");

		// logout() runs inside a dynamic import's .then(), which resolves after
		// the redirect above, so poll for it.
		await vi.waitFor(() => {
			expect(useUserStore.getState().user).toBeNull();
		});
	});

	it("does not clear the user store or redirect on a 401 while already on a public page", async () => {
		const location = setLocation("/login");
		const api = new TestApi();

		await expect(
			api.rejectedHandler({ response: { status: 401, data: {} } })
		).rejects.toBeDefined();

		expect(useUserStore.getState().user).not.toBeNull();
		expect(location.href).toBe(`http://localhost/login`);
	});

	it("rejects with the backend's message string for non-401 errors", async () => {
		setLocation("/dashboard");
		const api = new TestApi();

		await expect(
			api.rejectedHandler({ response: { status: 400, data: { message: "Invalid input" } } })
		).rejects.toBe("Invalid input");
	});

	it("joins an array of backend messages into a single newline-separated string", async () => {
		setLocation("/dashboard");
		const api = new TestApi();

		await expect(
			api.rejectedHandler({
				response: { status: 400, data: { message: ["Name is required", "Email is invalid"] } },
			})
		).rejects.toBe("Name is required\nEmail is invalid");
	});
});
