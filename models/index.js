// TODO: import sequelize from '[file where sequelize is configured (db.js, index.js, etc.)]';

import defineAbilities from './abilities.js';
import defineAbilityPrerequisiteList from './ability_prerequisite_list.js';
import defineCharacterAbilities from './character_abilities.js';
import defineCharacterClasses from './character_classes.js';
import defineCharacters from './characters.js';
import defineClassReference from './class_reference.js';
import defineUsers from './users.js';

const Abilities = defineAbilities(sequelize);
const AbilityPrerequisiteList = defineAbilityPrerequisiteList(sequelize);
const CharacterAbilities = defineCharacterAbilities(sequelize);
const CharacterClasses = defineCharacterClasses(sequelize);
const Characters = defineCharacters(sequelize);
const ClassReference = defineClassReference(sequelize);
const Users = defineUsers(sequelize);

export default {
    Abilities,
    AbilityPrerequisiteList,
    CharacterAbilities,
    CharacterClasses,
    Characters,
    ClassReference,
    Users
}