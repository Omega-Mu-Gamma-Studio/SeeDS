// playground/src/ui/CodePanel.js

class CodePanel {
  constructor(containerEl) {
    this.el = containerEl;
  }

  render(snapshot) {
    this.el.innerHTML = "";

    if (snapshot.placed.length === 0) {
      const empty = document.createElement("div");
      empty.id = "code-panel-empty";
      empty.innerHTML = "// Place a brick to start building.<br>// Code will appear here.";
      this.el.appendChild(empty);
      return;
    }

    for (const brickId of snapshot.placed) {
      const brick = snapshot.bricks.find(b => b.id === brickId);
      if (!brick) continue;

      // Order check — every dep must appear BEFORE this brick in the placed array
      const thisIdx = snapshot.placed.indexOf(brickId);
      const outOfOrder = brick.depends_on.filter(dep => {
        const depIdx = snapshot.placed.indexOf(dep);
        return depIdx === -1 || depIdx >= thisIdx;
      });
      const hasError = outOfOrder.length > 0;

      const block = document.createElement("div");
      block.className = "code-block" + (hasError ? " code-block--error" : "");

      const label = document.createElement("div");
      label.className = "code-block__label";
      label.textContent = brick.label;
      block.appendChild(label);

      if (hasError) {
        const errMsg = document.createElement("div");
        errMsg.className = "code-block__error-msg";
        const missingLabels = outOfOrder.map(depId => {
          const depBrick = snapshot.bricks.find(b => b.id === depId);
          return depBrick ? depBrick.label : depId;
        });
        errMsg.textContent = `⚠ Needs: ${missingLabels.join(", ")} — not defined yet`;
        block.appendChild(errMsg);
      }

      const pre = document.createElement("pre");
      pre.textContent = brick.code_snippet.join("\n");
      block.appendChild(pre);

      this.el.appendChild(block);
    }
  }
}

export default CodePanel;
