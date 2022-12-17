export interface INpmPackage {
	_id: string;
	_rev: string;
	name: string;
	time: {
		[key: string]: string;
	};
	maintainers: {
		[key: string]: {
			name: string;
			email: string;
		};
	};
	'dist-tags': {
		latest: string;
		[key: string]: string;
	};
	description: string;
	readme: string;
	version: {
		[key: string]: {
			name: string;
			description: string;
			version: string;
			[key: string]: string;
		};
	};
	homepage: string;
	keywords: {
		[key: string]: string;
	};
	repository: {
		type: string;
		url: string;
	};
	bugs: {
		url: string;
	};
	license: string;
	users: {
		[key: string]: boolean;
	};
	contributors: {
		[key: string]: string;
	};
}
