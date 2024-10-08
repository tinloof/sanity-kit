# Sanity Kit

Packages to help developing powerful content management experiences with Sanity.

## How to contribute

1. Make sure to install dependencies from the root folder, this will assure all deps are installed for sub-projects

2. Start turbo dev server for all packages by running

   ```
   npm run dev
   ```

   from the root folder

3. To preview changes we have `/apps`

   a. `/apps/next` is used to preview `sanity-web` changes

   b. `apps/studio` is used to preview `sanity-studio` changes

   depending on which package you are working on you can spawn the respective app, each app needs `.env` file to link to a sanity project.

   after updating the `.env` file for the needed app, just `npm run dev` from its directory.

_After everything is set, whenever a change is made to the package in dev will reflect in the preview app when it's in dev mode._

Check out [@tinloof/sanity-studio](https://github.com/tinloof/sanity-kit/tree/main/packages/sanity-studio) for more details.
