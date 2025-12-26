import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InputSection from "./InputSection";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("InputSection", () => {
  const defaultProps = {
    input: "",
    setInput: vi.fn(),
    onSolve: vi.fn(),
    error: null,
    isLoading: false,
    apiKey: "",
    setApiKey: vi.fn(),
  };

  it("renders input area and button correctly", () => {
    render(<InputSection {...defaultProps} />);
    expect(
      screen.getByPlaceholderText("input.placeholder")
    ).toBeInTheDocument();
    expect(screen.getByText("input.solve")).toBeInTheDocument();
    expect(screen.getByText("input.helper")).toBeInTheDocument();
  });

  it("updates input value on change", () => {
    render(<InputSection {...defaultProps} />);
    const textarea = screen.getByPlaceholderText("input.placeholder");
    fireEvent.change(textarea, { target: { value: "1, 2, 3" } });
    expect(defaultProps.setInput).toHaveBeenCalledWith("1, 2, 3");
  });

  it("disables solve button when input is empty", () => {
    render(<InputSection {...defaultProps} />);
    // Select by text because aria-label isn't strictly set on the button itself in the component code I saw
    // Use closest button or similar if needed, but text match is usually good enough for this structure
    const button = screen.getByRole("button", { name: /input.solve/i });
    expect(button).toBeDisabled();
  });

  it("enables solve button when input has text", () => {
    const props = { ...defaultProps, input: "1, 2, 3" };
    render(<InputSection {...props} />);
    const button = screen.getByRole("button", { name: /input.solve/i });
    expect(button).not.toBeDisabled();
  });

  it("calls onSolve when button is clicked", () => {
    const props = { ...defaultProps, input: "1, 2, 3" };
    render(<InputSection {...props} />);
    const button = screen.getByRole("button", { name: /input.solve/i });
    fireEvent.click(button);
    expect(defaultProps.onSolve).toHaveBeenCalled();
  });

  it("shows loading state correctly", () => {
    const props = { ...defaultProps, input: "1, 2, 3", isLoading: true };
    render(<InputSection {...props} />);

    expect(screen.getByText("input.processing")).toBeInTheDocument();
    // Verify spinner or loading indication if possible, but text is good

    // Button should be disabled while loading
    const button = screen.getByRole("button", { name: /input.processing/i });
    expect(button).toBeDisabled();
  });

  it("displays error message when error prop is provided", () => {
    const props = { ...defaultProps, error: "Invalid Sequence" };
    render(<InputSection {...props} />);

    expect(screen.getByText("input.error_title")).toBeInTheDocument();
    expect(screen.getByText("Invalid Sequence")).toBeInTheDocument();
  });

  it("toggles API Key input field", () => {
    render(<InputSection {...defaultProps} />);

    const toggleButton = screen.getByText("input.add_api_key");
    fireEvent.click(toggleButton);

    expect(
      screen.getByPlaceholderText("input.api_key_placeholder")
    ).toBeInTheDocument();
  });
});
