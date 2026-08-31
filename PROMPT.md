Publish this component to 21st.

1. If the 21st CLI is missing, install it and sign in (login opens a browser once):
npm i -g @21st-dev/cli && 21st login

2. Publish the component file (one self-contained .tsx; pass --demo <file> if the demo lives elsewhere):
21st publish <file> --to default --description "<one line>"

3. Open the CLI Review URL it prints. Check every demo in light and dark, fix anything blank or off-color, and republish before you finish.