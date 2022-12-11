const { existsSync } = require('fs');
const { writeFile, readFile } = require('fs/promises');

module.exports.GetConfig = async function GetConfig() {
	// check config file exists
	const configexists = existsSync('./config/projects.json') && true;
	/**
	 * @type {{items: string[], lastproject: number | null}}
	 */
	let projects = {
		items: [],
		lastproject: null,
	};
	if (!configexists) {
		await writeFile(
			'./config/projects.json',
			JSON.stringify({
				items: [],
				lastproject: null,
			})
		);
	} else {
		const rawproject = await readFile('./config/projects.json');
		projects = JSON.parse(rawproject.toString());
	}

	return {
		projects,
	};
};
