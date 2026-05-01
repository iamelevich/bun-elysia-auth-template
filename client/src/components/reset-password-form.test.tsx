import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test-utils";
import { ResetPasswordForm } from "./reset-password-form";

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
    resetPassword: vi.fn(),
  },
}));

import { authClient } from "@/lib/auth-client";

const resetPasswordMock = authClient.resetPassword as unknown as ReturnType<
  typeof vi.fn
>;

const TEST_TOKEN = "test-reset-token-abc123";

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders new password and confirm password fields", () => {
    renderWithProviders(<ResetPasswordForm token={TEST_TOKEN} />);

    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i }),
    ).toBeInTheDocument();
  });

  it("shows a back-to-sign-in link", () => {
    renderWithProviders(<ResetPasswordForm token={TEST_TOKEN} />);
    expect(
      screen.getByRole("link", { name: /back to sign in/i }),
    ).toBeInTheDocument();
  });

  it("calls authClient.resetPassword with the new password and token", async () => {
    resetPasswordMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<ResetPasswordForm token={TEST_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "newpassword123",
    );
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith({
        newPassword: "newpassword123",
        token: TEST_TOKEN,
      });
    });
  });

  it("navigates to /login after successful reset", async () => {
    resetPasswordMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<ResetPasswordForm token={TEST_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "newpassword123",
    );
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
    });
  });

  it("shows a server error when resetPassword fails", async () => {
    resetPasswordMock.mockResolvedValue({
      error: { message: "Token expired" },
    });
    const user = userEvent.setup();

    renderWithProviders(<ResetPasswordForm token={TEST_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "newpassword123",
    );
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText("Token expired")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordForm token={TEST_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "differentpass",
    );
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("does not submit when password is too short", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordForm token={TEST_TOKEN} />);

    await user.type(screen.getByLabelText("New password"), "short");
    await user.type(screen.getByLabelText("Confirm new password"), "short");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(resetPasswordMock).not.toHaveBeenCalled();
    });
  });
});
