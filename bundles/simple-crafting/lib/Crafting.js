
import { Item } from '@friday/ranvier';

const dataPath = __dirname + '/../data/';
import _loadedResources from dataPath + 'resources.json';
import _loadedRecipes from dataPath + 'recipes.json';

export class Crafting {
    static getResource(resourceKey) {
        return _loadedResources[resourceKey];
    }

    static getResourceItem(resourceKey) {
        const resourceDef = this.getResource(resourceKey);
        // create a temporary fake item for the resource for rendering purposes
        return new Item(null, {
            name: resourceDef.title,
            metadata: {
                quality: resourceDef.quality,
            },
            keywords: resourceKey,
            id: 1,
        });
    }

    static getRecipes() {
        return _loadedRecipes;
    }
}

export default Crafting;
