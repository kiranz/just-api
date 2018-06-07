const errorEx = require('error-ex');

export function customError(name, opts) {
    return errorEx(name, opts);
}

export const errorTypes = [
    'FileDoesNotExistError',
    'NotAValidYAMLCustomTypeError',
    'InvalidYAMLSuiteSchemaError',
    'InvalidSuiteConfigurationError',
    'DisabledSuiteError',
    'NoSpecsFoundError',
    'NoSpecFoundMatchingNameError',
    'RequestBodyNotFoundError',
    'ResponseStatusCodeDidNotMatchError',
    'ResponseHeaderValueDidNotMatchError',
    'YAMLSuiteLoadingError',
    'SuiteConfigurationFailedError',
    'BeforeAllHookError',
    'AfterAllHookError',
    'InvalidSpecificationSchemaError',
    'BeforeEachHookError',
    'AfterEachHookError',
    'BeforeTestHookError',
    'AfterTestHookError',
    'InvalidRequestSpecificationError',
    'InvalidRequestHeaderError',
    'RequestBuilderError',
    'RequestBodyBuilderError',
    'JSONBodyParseError',
    'LoadingSpecDependencySuiteError',
    'ResponseJSONDataMismatchError',
    'ResponseJSONSchemaValidationError',
    'CustomResponseValidationError',
    'LoopItemsBuilderError',
    'SuiteCustomConfigurationError',
    'CustomFunctionNotFoundInModuleError'
];
