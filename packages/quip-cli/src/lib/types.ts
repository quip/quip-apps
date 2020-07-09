interface Migration {
    version_number: number;
    js_file: string;
}

export interface Manifest {
    name: string;
    manifest_version: number;
    version_name: string;
    version_number: number;
    description?: string;
    toolbar_color?: string;
    diable_app_level_comments?: boolean;
    sizing_mode?: string;
    initial_width?: number;
    initial_height?: number;
    migrations?: Migration[];
}
