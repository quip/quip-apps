export const isMigration = (response: any): response is Migration =>
    response && response.js_file && response.version_number;

export interface Migration {
    version_number: number;
    js_file: string;
}

export interface Manifest {
    id: string;
    name: string;
    manifest_version: number;
    version_name: string;
    version_number: number;
    description?: string;
    toolbar_color?: string;
    toolbar_icon?: string;
    thumbnail?: string;
    diable_app_level_comments?: boolean;
    sizing_mode?: string;
    initial_width?: number;
    initial_height?: number;
    migrations?: Migration[];
    js_files?: string[];
    css_files?: string[];
    other_resources?: string[];
}
