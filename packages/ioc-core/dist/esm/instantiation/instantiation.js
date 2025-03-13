/**
 * 这里是存储生成的装饰器的，避免重复生成
 * DI means Dependency Injection 依赖注入
 * DI_TARGET和DI_DEPENDENCIES是自定义的两个key
 */
export var _util;
(function (_util) {
    _util.servicesIds = new Map();
    _util.DI_TARGET = '$di$target';
    _util.DI_DEPENDENCIES = '$di$dependencies';
    function getServiceDependencies(ctor) {
        return ctor[_util.DI_DEPENDENCIES] || [];
    }
    _util.getServiceDependencies = getServiceDependencies;
})(_util || (_util = {}));
function storeServiceDependency(id, target, index, optional) {
    if (target[_util.DI_TARGET] === target) {
        target[_util.DI_DEPENDENCIES].push({ id, index, optional });
    }
    else {
        target[_util.DI_DEPENDENCIES] = [{ id, index, optional }];
        target[_util.DI_TARGET] = target;
    }
}
export function createDecorator(serviceId) {
    if (_util.servicesIds.has(serviceId)) {
        return _util.servicesIds.get(serviceId);
    }
    const id = function (target, propertyKey, parameterIndex) {
        if (arguments.length !== 3) {
            throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(id, target, parameterIndex, false);
    };
    id.toString = () => serviceId;
    _util.servicesIds.set(serviceId, id);
    return id;
}
export function refineServiceDecorator(serviceIdentifier) {
    return serviceIdentifier;
}
/**
 * Mark a service dependency as optional.
 */
export function optional(serviceIdentifier) {
    return function (target, key, index) {
        if (arguments.length !== 3) {
            throw new Error('@optional-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(serviceIdentifier, target, index, true);
    };
}
export const IInstantiationService = createDecorator('instantiationService');
