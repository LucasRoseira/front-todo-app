<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 class="text-lg font-semibold mb-4">Are you sure you want to delete this task?</h3>

            <div class="flex justify-end space-x-2">
                <button @click="$emit('cancel')" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button @click="$emit('confirm')"
                    class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
            </div>
        </div>
    </div>
</template>
