goog.module('rxjs$operator$windowToggle');
var Subject_1 = goog.require('rxjs$Subject');
var Subscription_1 = goog.require('rxjs$Subscription');
var tryCatch_1 = goog.require('rxjs$util$tryCatch');
var errorObject_1 = goog.require('rxjs$util$errorObject');
var OuterSubscriber_1 = goog.require('rxjs$OuterSubscriber');
var subscribeToResult_1 = goog.require('rxjs$util$subscribeToResult');
/**
 *  Branch out the source Observable values as a nested Observable starting from an emission from `openings` and ending when the output of `closingSelector` emits. * <span class="informal">It's like {@link bufferToggle}, but emits a nested Observable instead of an array.</span> * <img src="./img/windowToggle.png" width="100%"> * Returns an Observable that emits windows of items it collects from the source Observable. The output Observable emits windows that contain those items emitted by the source Observable between the time when the `openings` Observable emits an item and when the Observable returned by `closingSelector` emits an item. *
 * @example <caption>Every other second, emit the click events from the next 500ms</caption> var clicks = Rx.Observable.fromEvent(document, 'click'); var openings = Rx.Observable.interval(1000); var result = clicks.windowToggle(openings, i => i % 2 ? Rx.Observable.interval(500) : Rx.Observable.empty() ).mergeAll(); result.subscribe(x => console.log(x)); *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowWhen}
 * @see {@link bufferToggle} * windows. the value emitted by the `openings` observable and returns an Observable, which, when it emits (either `next` or `complete`), signals that the associated window should complete. are Observables.
 * @method windowToggle
 * @owner Observable
 * @param {?} openings
 * @param {?} closingSelector
 * @return {?}
 */
function windowToggle(openings, closingSelector) {
    return this.lift(new WindowToggleOperator(openings, closingSelector));
}
exports.windowToggle = windowToggle;
class WindowToggleOperator {
    /**
     * @param {?} openings
     * @param {?} closingSelector
     */
    constructor(openings, closingSelector) {
        this.openings = openings;
        this.closingSelector = closingSelector;
    }
    /**
     * @param {?} subscriber
     * @param {?} source
     * @return {?}
     */
    call(subscriber, source) {
        return source._subscribe(new WindowToggleSubscriber(subscriber, this.openings, this.closingSelector));
    }
    static _tsickle_typeAnnotationsHelper() {
        /** @type {?} */
        WindowToggleOperator.prototype.openings;
        /** @type {?} */
        WindowToggleOperator.prototype.closingSelector;
    }
}
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class WindowToggleSubscriber extends OuterSubscriber_1.OuterSubscriber {
    /**
     * @param {?} destination
     * @param {?} openings
     * @param {?} closingSelector
     */
    constructor(destination, openings, closingSelector) {
        super(destination);
        this.openings = openings;
        this.closingSelector = closingSelector;
        this.contexts = [];
        this.add(this.openSubscription = subscribeToResult_1.subscribeToResult(this, openings, openings));
    }
    /**
     * @param {?} value
     * @return {?}
     */
    _next(value) {
        const { contexts } = this;
        if (contexts) {
            const /** @type {?} */ len = contexts.length;
            for (let /** @type {?} */ i = 0; i < len; i++) {
                contexts[i].window.next(value);
            }
        }
    }
    /**
     * @param {?} err
     * @return {?}
     */
    _error(err) {
        const { contexts } = this;
        this.contexts = null;
        if (contexts) {
            const /** @type {?} */ len = contexts.length;
            let /** @type {?} */ index = -1;
            while (++index < len) {
                const /** @type {?} */ context = contexts[index];
                context.window.error(err);
                context.subscription.unsubscribe();
            }
        }
        super._error(err);
    }
    /**
     * @return {?}
     */
    _complete() {
        const { contexts } = this;
        this.contexts = null;
        if (contexts) {
            const /** @type {?} */ len = contexts.length;
            let /** @type {?} */ index = -1;
            while (++index < len) {
                const /** @type {?} */ context = contexts[index];
                context.window.complete();
                context.subscription.unsubscribe();
            }
        }
        super._complete();
    }
    /**
     * @return {?}
     */
    _unsubscribe() {
        const { contexts } = this;
        this.contexts = null;
        if (contexts) {
            const /** @type {?} */ len = contexts.length;
            let /** @type {?} */ index = -1;
            while (++index < len) {
                const /** @type {?} */ context = contexts[index];
                context.window.unsubscribe();
                context.subscription.unsubscribe();
            }
        }
    }
    /**
     * @param {?} outerValue
     * @param {?} innerValue
     * @param {?} outerIndex
     * @param {?} innerIndex
     * @param {?} innerSub
     * @return {?}
     */
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        if (outerValue === this.openings) {
            const { closingSelector } = this;
            const /** @type {?} */ closingNotifier = tryCatch_1.tryCatch(closingSelector)(innerValue);
            if (closingNotifier === errorObject_1.errorObject) {
                return this.error(errorObject_1.errorObject.e);
            }
            else {
                const /** @type {?} */ window = new Subject_1.Subject();
                const /** @type {?} */ subscription = new Subscription_1.Subscription();
                const /** @type {?} */ context = { window, subscription };
                this.contexts.push(context);
                const /** @type {?} */ innerSubscription = subscribeToResult_1.subscribeToResult(this, closingNotifier, context);
                if (innerSubscription.isUnsubscribed) {
                    this.closeWindow(this.contexts.length - 1);
                }
                else {
                    ((innerSubscription)).context = context;
                    subscription.add(innerSubscription);
                }
                this.destination.next(window);
            }
        }
        else {
            this.closeWindow(this.contexts.indexOf(outerValue));
        }
    }
    /**
     * @param {?} err
     * @return {?}
     */
    notifyError(err) {
        this.error(err);
    }
    /**
     * @param {?} inner
     * @return {?}
     */
    notifyComplete(inner) {
        if (inner !== this.openSubscription) {
            this.closeWindow(this.contexts.indexOf(((inner)).context));
        }
    }
    /**
     * @param {?} index
     * @return {?}
     */
    closeWindow(index) {
        if (index === -1) {
            return;
        }
        const { contexts } = this;
        const /** @type {?} */ context = contexts[index];
        const { window, subscription } = context;
        contexts.splice(index, 1);
        window.complete();
        subscription.unsubscribe();
    }
    static _tsickle_typeAnnotationsHelper() {
        /** @type {?} */
        WindowToggleSubscriber.prototype.contexts;
        /** @type {?} */
        WindowToggleSubscriber.prototype.openSubscription;
        /** @type {?} */
        WindowToggleSubscriber.prototype.openings;
        /** @type {?} */
        WindowToggleSubscriber.prototype.closingSelector;
    }
}
