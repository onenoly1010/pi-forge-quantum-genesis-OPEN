from __future__ import annotations

import gradio as gr


def health_check() -> dict[str, str]:
    """Simple health check for the Gradio interface."""
    return {"status": "healthy"}


def create_interface() -> gr.Interface:
    """Create the Gradio interface used for the ethics panel."""
    return gr.Interface(fn=health_check, inputs=None, outputs="json")


def main() -> None:
    interface = create_interface()
    interface.launch(server_name="0.0.0.0", server_port=7860, show_error=True)


if __name__ == "__main__":
    main()
