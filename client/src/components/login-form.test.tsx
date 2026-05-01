import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test-utils";
import { LoginForm } from "./login-form";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => React.createElement("a", { href: to, ...props }, children),
  useNavigate: () => mockNavigate,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

vi.mock("@/queries/settings", () => ({
  useIsRegistrationDisabledQuery: vi.fn(() => ({ data: false })),
}));

import React from "react";
import { authClient } from "@/lib/auth-client";
import { useIsRegistrationDisabledQuery } from "@/queries/settings";

const signInMock = authClient.signIn.email as ReturnType<typeof vi.fn>;
const useIsRegistrationDisabledQueryMock =
  useIsRegistrationDisabledQuery as ReturnType<typeof vi.fn>;

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useIsRegistrationDisabledQueryMock.mockReturnValue({ data: false });
  });

  it("renders email and password fields and a submit button", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows a sign-up link when registration is enabled", () => {
    useIsRegistrationDisabledQueryMock.mockReturnValue({ data: false });
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("hides the sign-up link when registration is disabled", () => {
    useIsRegistrationDisabledQueryMock.mockReturnValue({ data: true });
    renderWithProviders(<LoginForm />);

    expect(
      screen.queryByRole("link", { name: /sign up/i }),
    ).not.toBeInTheDocument();
  });

  it("calls authClient.signIn.email with entered credentials on submit", async () => {
    signInMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
      });
    });
  });

  it("navigates to '/' after successful sign-in", async () => {
    signInMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  it("shows a server error message when sign-in fails", async () => {
    signInMock.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });
    const user = userEvent.setup();

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not submit when email is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInMock).not.toHaveBeenCalled();
    });
  });
});
