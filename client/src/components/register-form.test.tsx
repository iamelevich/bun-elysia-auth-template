import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test-utils";
import { RegisterForm } from "./register-form";

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
    signUp: {
      email: vi.fn(),
    },
  },
}));

import { authClient } from "@/lib/auth-client";

const signUpMock = authClient.signUp.email as ReturnType<typeof vi.fn>;

async function fillRegisterForm(
  user: ReturnType<typeof userEvent.setup>,
  opts: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {},
) {
  const {
    name = "John Doe",
    email = "john@example.com",
    password = "password123",
    confirmPassword = "password123",
  } = opts;

  if (name) await user.type(screen.getByLabelText(/^name$/i), name);
  if (email) await user.type(screen.getByLabelText(/^email$/i), email);
  if (password) await user.type(screen.getByLabelText(/^password$/i), password);
  if (confirmPassword)
    await user.type(
      screen.getByLabelText(/confirm password/i),
      confirmPassword,
    );
}

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required fields and a submit button", () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("shows a sign-in link", () => {
    renderWithProviders(<RegisterForm />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("calls authClient.signUp.email with form values on successful submit", async () => {
    signUpMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />);
    await fillRegisterForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
    });
  });

  it("navigates to '/' after successful registration", async () => {
    signUpMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />);
    await fillRegisterForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  it("shows a server error message when sign-up fails", async () => {
    signUpMock.mockResolvedValue({
      error: { message: "Email already in use" },
    });
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />);
    await fillRegisterForm(user);
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not submit when passwords do not match", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />);
    await fillRegisterForm(user, {
      password: "password123",
      confirmPassword: "different456",
    });
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("does not submit when name is empty", async () => {
    const user = userEvent.setup();

    renderWithProviders(<RegisterForm />);
    await fillRegisterForm(user, { name: "" });
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUpMock).not.toHaveBeenCalled();
    });
  });
});
