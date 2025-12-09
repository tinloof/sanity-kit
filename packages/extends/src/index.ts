export type {
	AbstractDefinition,
	AbstractDefinitionResolver,
	CreateAbstractsConfig,
	ExtendedType,
	ExtendsRegistry,
} from "./types";

import "./types";

export {defineAbstractResolver} from "./define-abstract-resolver";
export {resolveAbstractSchemaTypes} from "./resolve-abstract-schema-types";

export {withExtends} from "./with-extends";
