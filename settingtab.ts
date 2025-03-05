import LiteGallery from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class LiteGallerySettingTab extends PluginSettingTab {
  plugin: LiteGallery;

  constructor(app: App, plugin: LiteGallery) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Image folders")
      .setDesc("Comma separated list of folders to search for images (in order of priority).")
      .addText((text) =>
        text
          .setPlaceholder("/")
          .setValue(this.plugin.settings.setting_value)
          .onChange(async (value) => {
            this.plugin.settings.setting_value = value;
            this.plugin.settings.image_folders = this.plugin.parse_folder_settings_as_paths(value);
            await this.plugin.save_settings();
          })
      );
  }
}