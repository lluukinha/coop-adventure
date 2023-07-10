import * as ex from 'excalibur';
/**
 * Our main menu scene, which will have HTML-based UI
 */
export class MainMenu extends ex.Scene {
  ui: HTMLDivElement = document.getElementById('ui') as HTMLDivElement;
  engine: ex.Engine;

  constructor(engine: ex.Engine) {
    super();
    this.engine = engine;
  }

  onActivate() {
    // Add a CSS class to `ui` that helps indicate which scene is being displayed
    this.ui.classList.add('MainMenu');

    // Create a <button /> element
    const btnStart = document.createElement('button');

    // Style it outside JavaScript for ease of use
    btnStart.className = 'button button--start';
    btnStart.innerText = 'START GAME';

    // Handle the DOM click event
    btnStart.onclick = (e) => {
      e.preventDefault();

      // Transition the game to the new scene
      this.engine.emit('startGame', () => {});
    };

    // Append the <button /> to our `ui` container
    this.ui.appendChild(btnStart);
  }

  onDeactivate() {
    // Ensure we cleanup the DOM and remove any children when transitioning scenes
    this.ui.classList.remove('MainMenu');
    this.ui.innerHTML = '';
  }
}
