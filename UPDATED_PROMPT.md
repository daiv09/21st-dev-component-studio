Publish this component to 21st.

Automation setup (endless): Monitor the TODO folder continuously. When a .tsx file is dropped there, start the full process immediately and repeat for every new file.

1. Ensure the component code supports both light and dark mode (use theme-aware styles, CSS variables, or a light/dark toggle). If it is missing, add it before publishing.

2. If the 21st CLI is missing, install it and sign in (login opens a browser once):
npm i -g @21st-dev/cli && 21st login

3. Publish the component file (self-contained .tsx; use the file from the TODO folder):
21st publish <file> --to default --description "<one line describing the component with light/dark support>" --tags "animation,interactive,dark-mode,ui-component,light-dark" --visibility published

Note: The CLI should trigger automatic cover image generation (light and dark previews) and background preview video generation. Confirm these flags/assets are activated.

4. Open the CLI Review URL it prints. Thoroughly toggle and check every demo in both light and dark modes. Verify that auto-generated media assets (cover images for light/dark and preview video) rendered correctly. Fix anything blank, broken, off-color, or missing, and republish before you finish.

5. Once done for one file, keep monitoring TODO. As soon as another .tsx is added, restart from step 1. Work endlessly.
