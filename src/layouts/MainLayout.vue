<template>
  <div class="flex h-screen">
    <div class="w-64">
      <!-- Sidebar content -->
      <h2 class="text-2xl font-bold p-4">Sidebar</h2>
      <ul>
        <li class="p-4 hover:bg-gray-700 cursor-pointer">Home</li>
        <li class="p-4 hover:bg-gray-700 cursor-pointer">Profile</li>
        <li class="p-4 hover:bg-gray-700 cursor-pointer">Settings</li>
      </ul>
    </div>
    <div class="flex-1 bg-gray-100 p-6">
      <!-- Main content -->
      <h1 class="text-3xl font-bold mb-4">Main Content</h1>
      <p>This is the main content area.</p>
    </div>
  </div>
</template>