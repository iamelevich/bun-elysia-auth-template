import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test-utils";
import { ForgotPasswordForm } from "./forgot-password-form";

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
  useNavigate: () => vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    requestPasswordReset: vi.fn(),
  },
}));

import { authClient } from "@/lib/auth-client";

const forgetPasswordMock = authClient.requestPasswordReset as ReturnType<
  typeof vi.fn
>;

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost" },
      writable: true,
    });
  });

  it("renders the email field and submit button", () => {
    renderWithProviders(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("shows a back-to-sign-in link", () => {
    renderWithProviders(<ForgotPasswordForm />);
    expect(
      screen.getByRole("link", { name: /back to sign in/i }),
    ).toBeInTheDocument();
  });

  it("calls authClient.forgetPassword with email and redirectTo", async () => {
    forgetPasswordMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(forgetPasswordMock).toHaveBeenCalledWith({
        email: "user@example.com",
        redirectTo: "http://localhost/reset-password",
      });
    });
  });

  it("shows success state after successful submission", async () => {
    forgetPasswordMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/check your email for a reset link/i),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /send reset link/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send again/i }),
    ).toBeInTheDocument();
  });

  it("shows a server error when forgetPassword fails", async () => {
    forgetPasswordMock.mockResolvedValue({
      error: { message: "Too many requests" },
    });
    const user = userEvent.setup();

    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText("Too many requests")).toBeInTheDocument();
    });
    expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
  });

  it("resets to the form after clicking 'Send again'", async () => {
    forgetPasswordMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /send again/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /send again/i }));

    expect(
      screen.getByRole("button", { name: /send reset link/i }),
    ).toBeInTheDocument();
  });

  it("does not submit when email is invalid", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(forgetPasswordMock).not.toHaveBeenCalled();
    });
  });
});
