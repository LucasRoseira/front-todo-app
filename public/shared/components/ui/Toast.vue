<template>
    <transition enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="show" :class="[
            'fixed bottom-4 right-4 z-50 max-w-xs w-full rounded-lg shadow-lg overflow-hidden',
            typeClasses[type],
        ]" @click="hide">
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <Icon :name="iconNames[type]" class="h-5 w-5" />
                    </div>
                    <div class="ml-3 w-0 flex-1 pt-0.5">
                        <p class="text-sm font-medium text-white">
                            {{ message }}
                        </p>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="inline-flex text-white focus:outline-none focus:text-white" @click.stop="hide">
                            <span class="sr-only">Fechar</span>
                            <Icon name="heroicons:x-mark" class="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
const show = ref(false);
const message = ref("");
const type = ref<"success" | "error" | "info" | "warning">("success");
const timeout = ref(3000);

const typeClasses = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
};

const iconNames = {
    success: "heroicons:check-circle",
    error: "heroicons:exclamation-circle",
    info: "heroicons:information-circle",
    warning: "heroicons:exclamation-triangle",
};

const hide = () => {
    show.value = false;
};

const toast = (
    msg: string,
    toastType: "success" | "error" | "info" | "warning" = "success",
    duration = 600000
) => {
    message.value = msg;
    type.value = toastType;
    show.value = true;
    timeout.value = duration;

    setTimeout(hide, duration);
};

defineExpose({
    success: (msg: string, duration?: number) => toast(msg, "success", duration),
    error: (msg: string, duration?: number) => toast(msg, "error", duration),
    info: (msg: string, duration?: number) => toast(msg, "info", duration),
    warning: (msg: string, duration?: number) => toast(msg, "warning", duration),
});
</script>